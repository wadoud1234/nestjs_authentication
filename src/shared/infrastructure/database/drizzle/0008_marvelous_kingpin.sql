ALTER TABLE "categories" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "price" numeric NOT NULL;