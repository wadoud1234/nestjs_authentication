CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "role";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");