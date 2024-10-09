import { Migration } from '@mikro-orm/migrations';

export class Migration20241008164339 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "settings" ("id" serial primary key, "telegram_web_app_url" varchar(255) null default 'https://t.me/s0nicash_bot/start', "telegram_channel_id" varchar(64) null default '-1002217295250', "user_starting_balance" int not null default 5000, "max_daily_energy_replenishment" int not null default 6, "max_offline_profit_hours" int not null default 3, "referral_reward" int not null default 5000, "daily_reward" int not null default 5000, "starting_energy_limit" int not null default 100, "energy_limit_per_character" int not null default 100, "energy_limit_per_level" int not null default 100, "energy_limit_per_booster" int not null default 100);`);

    this.addSql(`alter table "earn_tasks" drop constraint "earn_tasks_name_unique";`);
    this.addSql(`alter table "earn_tasks" drop column "name";`);

    this.addSql(`alter table "earn_tasks" add column "created_at" timestamptz not null, add column "updated_at" timestamptz not null, add column "title" varchar(64) not null;`);

    this.addSql(`alter table "user_levels" alter column "required_balance" type bigint using ("required_balance"::bigint);`);
    this.addSql(`alter table "user_levels" add constraint "user_levels_level_unique" unique ("level");`);
    this.addSql(`alter table "user_levels" add constraint "user_levels_required_balance_unique" unique ("required_balance");`);

    this.addSql(`alter table "users" add column "country" varchar(64) not null, add column "is_banned" boolean not null, add column "total_claimed_balance" bigint not null, add column "total_balance_get_from_clicks" bigint not null, add column "referrals_count" int not null;`);
    this.addSql(`create index "users_country_index" on "users" ("country");`);
    this.addSql(`create index "users_referrals_count_index" on "users" ("referrals_count");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "settings" cascade;`);

    this.addSql(`alter table "earn_tasks" drop column "created_at", drop column "updated_at", drop column "title";`);

    this.addSql(`alter table "earn_tasks" add column "name" varchar(255) not null;`);
    this.addSql(`alter table "earn_tasks" add constraint "earn_tasks_name_unique" unique ("name");`);

    this.addSql(`alter table "user_levels" drop constraint "user_levels_level_unique";`);
    this.addSql(`alter table "user_levels" drop constraint "user_levels_required_balance_unique";`);

    this.addSql(`alter table "user_levels" alter column "required_balance" type int using ("required_balance"::int);`);

    this.addSql(`drop index "users_country_index";`);
    this.addSql(`drop index "users_referrals_count_index";`);
    this.addSql(`alter table "users" drop column "country", drop column "is_banned", drop column "total_claimed_balance", drop column "total_balance_get_from_clicks", drop column "referrals_count";`);
  }

}
