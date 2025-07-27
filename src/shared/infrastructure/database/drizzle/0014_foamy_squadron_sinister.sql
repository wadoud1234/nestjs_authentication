ALTER TABLE "reviews" ALTER COLUMN "comment" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "comment" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_user_id_book_id_unique" UNIQUE("user_id","book_id");