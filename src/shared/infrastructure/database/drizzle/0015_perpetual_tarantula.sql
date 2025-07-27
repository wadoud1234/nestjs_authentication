ALTER TABLE "books" ADD COLUMN "ratings_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_book_id_unique" UNIQUE("user_id","book_id");