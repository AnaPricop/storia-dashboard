
SELECT
    titlu,
    locatie,
    link,
    TRY_CAST(REGEXP_SUBSTR(camere_brut, '\\d+') AS INT) AS numar_camere,
    TRY_CAST(REPLACE(REGEXP_SUBSTR(suprafata_brut, '[0-9,.]+'), ',', '.') AS FLOAT) AS suprafata_mp,
    TRY_CAST(REGEXP_REPLACE(pret_brut, '[^\\d]', '') AS INT) AS pret,
    CASE
        WHEN pret_brut ILIKE '%€%' THEN 'EUR'
        WHEN pret_brut ILIKE '%RON%' THEN 'RON'
        ELSE NULL
        END AS valuta,
    etaj_brut AS etaj,

    TRY_CAST(data_postare AS DATE) AS data_postare

FROM {{ source('storia_data', 'raw_storia_listings') }}