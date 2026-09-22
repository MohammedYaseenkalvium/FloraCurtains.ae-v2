-- Point the settings logo default at the deployment-safe asset name.
-- The file itself was renamed byte-identical: public/images/FLora quotation logo.png
-- (space in name 404s on production) -> public/images/flora-logo.png.
ALTER TABLE "app_settings" ALTER COLUMN "logoUrl" SET DEFAULT '/images/flora-logo.png';

-- Normalize any rows still pointing at obsolete logo paths.
UPDATE "app_settings" SET "logoUrl" = '/images/flora-logo.png' WHERE "logoUrl" IN ('/images/logo.png', '/images/Flora quotation logo.png', '/images/Flora%20quotation%20logo.png');
