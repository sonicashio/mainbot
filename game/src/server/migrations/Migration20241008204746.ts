import { Migration } from '@mikro-orm/migrations';

export class Migration20241008204746 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "statics_users" ("id" serial primary key, "date" timestamptz not null, "total_users" int not null, "total_clicks" int not null, "total_clicks_coins" int not null, "total_coins" int not null, "avg_clicks_per_user" int not null, "avg_coins_per_user" int not null, "most_active_user" varchar(255) not null, "new_users24h" int not null, "total_referral_rewards" int not null, "user_growth7day" jsonb not null, "top_users" jsonb not null, "users_by_country" jsonb not null);`);
    this.addSql(`alter table "statics_users" add constraint "statics_users_date_unique" unique ("date");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "statics_users" cascade;`);
  }

}
