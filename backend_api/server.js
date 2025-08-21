const express = require('express');
const snowflake = require('snowflake-sdk');
const cors = require('cors');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const port = 3001;
const appCache = new NodeCache({ stdTTL: 600 });

app.use(cors());

function buildWhereClause(queryParams) {
    const { search, rooms, 'priceRange[]': priceRange, 'surfaceRange[]': surfaceRange } = queryParams;
    const whereClauses = ["1=1"];
    const params = [];

    if (search && search.trim() !== '') {
        whereClauses.push("(titlu ILIKE ? OR locatie ILIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
    }

    if (rooms && rooms.trim() !== '' && !isNaN(parseInt(rooms))) {
        whereClauses.push("numar_camere = ?");
        params.push(parseInt(rooms));
    }

    if (priceRange && Array.isArray(priceRange) && priceRange.length === 2) {
        const minPrice = parseInt(priceRange[0], 10);
        const maxPrice = parseInt(priceRange[1], 10);
        if (!isNaN(minPrice) && minPrice > 0) {
            whereClauses.push("pret >= ?");
            params.push(minPrice);
        }
        if (!isNaN(maxPrice) && maxPrice < 500000) {
            whereClauses.push("pret <= ?");
            params.push(maxPrice);
        }
    }

    if (surfaceRange && Array.isArray(surfaceRange) && surfaceRange.length === 2) {
        const minSurface = parseInt(surfaceRange[0], 10);
        const maxSurface = parseInt(surfaceRange[1], 10);
        if (!isNaN(minSurface) && minSurface > 0) {
            whereClauses.push("suprafata_mp >= ?");
            params.push(minSurface);
        }
        if (!isNaN(maxSurface) && maxSurface < 200) {
            whereClauses.push("suprafata_mp <= ?");
            params.push(maxSurface);
        }
    }

    return {
        clause: `WHERE ${whereClauses.join(' AND ')}`,
        params: params
    };
}

async function runQuery(query, params = []) {
    const connection = snowflake.createConnection({
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USER,
        password: process.env.SNOWFLAKE_PASSWORD,
        database: process.env.SNOWFLAKE_DATABASE,
        schema: process.env.SNOWFLAKE_SCHEMA,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    });

    return new Promise((resolve, reject) => {
        connection.connect((err, conn) => {
            if (err) {
                console.error('Unable to connect to Snowflake:', err.message);
                return reject(err);
            }
            conn.execute({
                sqlText: query,
                binds: params,
                complete: (err, stmt, rows) => {
                    conn.destroy(() => {});
                    if (err) {
                        console.error('Failed to execute statement:', err);
                        return reject(err);
                    }
                    resolve(rows);
                }
            });
        });
    });
}


// API + CACHE
app.get('/api/listings', async (req, res) => {
    try {
        const cacheKey = req.originalUrl;
        if (appCache.has(cacheKey)) {
            return res.json(appCache.get(cacheKey));
        }

        const { page = 1, pageSize = 15 } = req.query;
        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);
        const offset = (pageNum - 1) * pageSizeNum;
        const { clause, params } = buildWhereClause(req.query);

        const listingsQuery = `
            SELECT titlu, locatie, pret, suprafata_mp, pret_pe_mp, link, data_postare, numar_camere
            FROM dim_listings
                     ${clause}
            ORDER BY data_postare DESC, pret DESC
                LIMIT ? OFFSET ?;
        `;
        const listings = await runQuery(listingsQuery, [...params, pageSizeNum, offset]);

        const countQuery = `SELECT COUNT(*) AS total_count FROM dim_listings ${clause};`;
        const countResult = await runQuery(countQuery, params);
        const totalCount = countResult[0].TOTAL_COUNT;

        const responseData = {
            listings: listings,
            totalPages: Math.ceil(totalCount / pageSizeNum),
            currentPage: pageNum
        };

        appCache.set(cacheKey, responseData);
        res.json(responseData);

    } catch (error) {
        console.error("!!! ERROR in /api/listings:", error);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

app.get('/api/stats/kpis', async (req, res) => {
    try {
        const cacheKey = req.originalUrl;
        if (appCache.has(cacheKey)) {
            return res.json(appCache.get(cacheKey));
        }

        const { clause, params } = buildWhereClause(req.query);
        const query = `
            WITH filtered_listings AS (
                SELECT * FROM dim_listings ${clause}
            ), aggregates AS (
                SELECT
                    COUNT(*) AS total_listings,
                    ROUND(AVG(pret), 0) AS average_price,
                    ROUND(AVG(pret_pe_mp), 0) AS average_price_sqm
                FROM filtered_listings
            ), top_district AS (
                SELECT SPLIT_PART(locatie, ',', 2) AS district
                FROM filtered_listings
                ORDER BY pret_pe_mp DESC
                LIMIT 1
            )
            SELECT
                a.total_listings, a.average_price, a.average_price_sqm,
                COALESCE(td.district, 'N/A') AS most_expensive_district
            FROM aggregates a
            LEFT JOIN top_district td ON TRUE;
        `;
        const kpisResult = await runQuery(query, params);
        const kpisData = kpisResult[0];

        appCache.set(cacheKey, kpisData);
        res.json(kpisData);
    } catch (error) {
        console.error("!!! ERROR in /api/stats/kpis:", error);
        res.status(500).json({ error: 'Failed to fetch KPIs' });
    }
});

app.get('/api/stats/avg_price_by_district', async (req, res) => {
    try {
        const cacheKey = req.originalUrl;
        if (appCache.has(cacheKey)) {
            return res.json(appCache.get(cacheKey));
        }

        const { clause, params } = buildWhereClause(req.query);
        const { sort = 'desc', limit = 10 } = req.query;
        const sortOrder = sort.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
        const limitCount = !isNaN(parseInt(limit)) ? parseInt(limit) : 10;
        const query = `
            SELECT
                SPLIT_PART(locatie, ',', 2) AS district,
                ROUND(AVG(pret_pe_mp), 0) AS avg_price_sqm
            FROM dim_listings
            ${clause} AND district IS NOT NULL AND pret_pe_mp IS NOT NULL
            GROUP BY district
            ORDER BY avg_price_sqm ${sortOrder}
            LIMIT ?;
        `;
        const finalParams = [...params, limitCount];
        const stats = await runQuery(query, finalParams);

        appCache.set(cacheKey, stats);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch district stats' });
    }
});

app.get('/api/stats/distribution_by_rooms', async (req, res) => {
    try {
        const cacheKey = req.originalUrl;
        if (appCache.has(cacheKey)) {
            return res.json(appCache.get(cacheKey));
        }

        const { clause, params } = buildWhereClause(req.query);
        const query = `
            SELECT 
                CASE 
                    WHEN numar_camere = 1 THEN '1 Camera (Garsoniera)'
                    WHEN numar_camere >= 5 THEN '5+ Camere'
                    ELSE CAST(numar_camere AS VARCHAR) || ' Camere' 
                END AS room_category,
                COUNT(*) AS ad_count
            FROM dim_listings
            ${clause} AND numar_camere IS NOT NULL
            GROUP BY room_category
            ORDER BY room_category;
        `;
        const stats = await runQuery(query, params);

        appCache.set(cacheKey, stats);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch room distribution stats' });
    }
});

app.get('/api/stats/distribution_by_sector', async (req, res) => {
    try {
        const cacheKey = req.originalUrl;
        if (appCache.has(cacheKey)) {
            return res.json(appCache.get(cacheKey));
        }

        const { clause, params } = buildWhereClause(req.query);
        const query = `
            SELECT 
                REGEXP_SUBSTR(locatie, 'Sectorul \\\\d') AS sector,
                COUNT(*) as ad_count
            FROM dim_listings
            ${clause} AND sector IS NOT NULL
            GROUP BY sector
            ORDER BY ad_count DESC;
        `;
        const stats = await runQuery(query, params);

        appCache.set(cacheKey, stats);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sector distribution stats' });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening on http://localhost:${port}`);
});