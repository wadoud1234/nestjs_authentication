ALTER TYPE "public"."role" ADD VALUE 'AUTHOR';--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "description" SET NOT NULL;