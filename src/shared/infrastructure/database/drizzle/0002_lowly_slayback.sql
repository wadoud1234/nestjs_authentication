CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"pages" integer DEFAULT 0 NOT NULL,
	"stock" integer NOT NULL,
	"author_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"raitng" real DEFAULT 0 NOT NULL,
	"isbn" varchar(100) NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "books_title_unique" UNIQUE("title"),
	CONSTRAINT "books_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "bio" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "bio" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lastConnection" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "slug_idx" ON "books" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "title_idx" ON "books" USING btree ("title");--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");