ALTER TABLE "books" ALTER COLUMN "price" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "price" SET NOT NULL;