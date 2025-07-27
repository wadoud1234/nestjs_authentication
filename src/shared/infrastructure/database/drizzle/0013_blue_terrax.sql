ALTER TABLE "books" RENAME COLUMN "raitng" TO "rating";--> statement-breakpoint
CREATE INDEX "author_id_idx" ON "books" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "price_idx" ON "books" USING btree ("price");