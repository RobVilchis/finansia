CREATE TABLE "statements" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"user_id" varchar(191),
	"original_file_name" text NOT NULL,
	"extracted_text" text,
	"status" text DEFAULT 'uploaded',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "is_unverified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "statements" ADD CONSTRAINT "statements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;