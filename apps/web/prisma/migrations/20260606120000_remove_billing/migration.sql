-- Remove SaaS billing and usage quota tables/columns (OSS pivot)
ALTER TABLE "User" DROP COLUMN IF EXISTS "stripeCustomerId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "plan";
ALTER TABLE "User" DROP COLUMN IF EXISTS "acceptedTermsAt";
DROP TABLE IF EXISTS "UsageCounter";
DROP TYPE IF EXISTS "Plan";
