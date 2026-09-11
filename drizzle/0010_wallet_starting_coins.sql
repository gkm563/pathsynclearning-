-- New accounts must start at 0 coins (3480 was leftover demo seed).
--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "coins" SET DEFAULT 0;
--> statement-breakpoint
UPDATE "wallets" AS w
SET "coins" = 0, "updated_at" = NOW()
WHERE w."coins" = 3480
  AND NOT EXISTS (
    SELECT 1
    FROM "wallet_transactions" AS t
    WHERE t."user_id" = w."user_id"
      AND t."amount_coins" <> 0
  );
