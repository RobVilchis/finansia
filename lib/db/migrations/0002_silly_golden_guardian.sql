CREATE TABLE "financial_tips" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"month" text NOT NULL,
	"category" text,
	"title" text NOT NULL,
	"full_text" text NOT NULL,
	"generated_at" timestamp DEFAULT now(),
	"source" text DEFAULT 'openai'
);
--> statement-breakpoint
ALTER TABLE "financial_tips" ADD CONSTRAINT "financial_tips_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;