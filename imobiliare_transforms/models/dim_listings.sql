WITH stg_listings AS (
    SELECT * FROM {{ ref('stg_storia_listings') }}
)

SELECT
    *,

    DIV0(pret, suprafata_mp) AS pret_pe_mp

FROM stg_listings
WHERE
    pret > 0 AND suprafata_mp > 0