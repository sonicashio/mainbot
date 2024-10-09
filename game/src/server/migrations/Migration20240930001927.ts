import { Migration } from '@mikro-orm/migrations';

export class Migration20240930001927 extends Migration {

  override async up(): Promise<void> {    
    this.addSql(`create type "earn_task_type" as enum ('telegram_join', 'x_follow', 'youtube_subscribe', 'invite_friends');`);
    this.addSql(`create type "user_role" as enum ('admin', 'moderator', 'support', 'user');`);
    this.addSql(`create table "characters" ("id" serial primary key, "rank" smallint not null, "name" varchar(64) not null, "price" int not null, "max_level_id" int null);`);
    this.addSql(`alter table "characters" add constraint "characters_rank_unique" unique ("rank");`);
    this.addSql(`alter table "characters" add constraint "characters_name_unique" unique ("name");`);

    this.addSql(`create table "character_levels" ("id" serial primary key, "character_id" int not null, "level" int not null, "price" int not null, "profit_per_hour" int not null, "profit_per_hour_view_only" int not null);`);
    this.addSql(`create index "character_levels_character_id_index" on "character_levels" ("character_id");`);

    this.addSql(`create table "boosters_click_power_levels" ("id" serial primary key, "level" int not null, "price" int not null);`);
    this.addSql(`alter table "boosters_click_power_levels" add constraint "boosters_click_power_levels_level_unique" unique ("level");`);

    this.addSql(`create table "rewards_daily_logins" ("id" serial primary key, "day" int not null, "reward" int not null, "spcial_day" boolean not null);`);
    this.addSql(`alter table "rewards_daily_logins" add constraint "rewards_daily_logins_day_unique" unique ("day");`);

    this.addSql(`create table "earn_tasks" ("id" serial primary key, "name" varchar(255) not null, "type" "earn_task_type" not null, "reward" int not null, "requirements" jsonb not null, "user_can_complete" boolean not null);`);
    this.addSql(`alter table "earn_tasks" add constraint "earn_tasks_name_unique" unique ("name");`);

    this.addSql(`create table "boosters_energy_limit_levels" ("id" serial primary key, "level" int not null, "price" int not null);`);
    this.addSql(`alter table "boosters_energy_limit_levels" add constraint "boosters_energy_limit_levels_level_unique" unique ("level");`);

    this.addSql(`create table "user_levels" ("id" serial primary key, "level" int not null, "name" varchar(64) not null, "balance_reward" int not null, "required_balance" int not null, "profit_per_hour" int not null);`);
    this.addSql(`alter table "user_levels" add constraint "user_levels_name_unique" unique ("name");`);

    this.addSql(`create table "users" ("id" bigserial primary key, "version" int not null default 1, "first_name" varchar(64) not null, "last_name" varchar(64) null, "username" varchar(64) null, "photo_url" varchar(255) null, "role" "user_role" not null, "telegram_id" bigint not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "level_id" int not null, "balance" bigint not null, "balance_per_click" int not null, "total_clicks" int not null, "last_click_sync_time" bigint not null, "profit_per_hour" int not null, "last_profit_sync_time" bigint not null, "selected_character_id" int null, "refered_by_id" int null, "total_referral_rewards" int not null, "energy" int not null, "energy_limit" int not null, "last_energy_modified_time" bigint not null, "daily_energy_replenishment_used" int not null, "daily_energy_replenishment_claimed_day_time" bigint null, "last_login_reward_day" int not null, "last_daily_login_claimed_day_time" bigint null, "last_daily_reward_claim_time" bigint null);`);
    this.addSql(`create index "users_username_index" on "users" ("username");`);
    this.addSql(`create index "users_photo_url_index" on "users" ("photo_url");`);
    this.addSql(`create index "users_telegram_id_index" on "users" ("telegram_id");`);
    this.addSql(`alter table "users" add constraint "users_telegram_id_unique" unique ("telegram_id");`);
    this.addSql(`create index "users_level_id_index" on "users" ("level_id");`);
    this.addSql(`create index "users_profit_per_hour_index" on "users" ("profit_per_hour");`);
    this.addSql(`alter table "users" add constraint "users_selected_character_id_unique" unique ("selected_character_id");`);

    this.addSql(`create table "user_characters" ("id" serial primary key, "version" int not null default 1, "owner_id" bigint not null, "character_id" int not null, "current_level" int not null default 0, "unlocked_at" timestamptz not null);`);
    this.addSql(`create index "user_characters_owner_id_index" on "user_characters" ("owner_id");`);
    this.addSql(`create index "user_characters_character_id_index" on "user_characters" ("character_id");`);
    this.addSql(`create index "user_characters_current_level_index" on "user_characters" ("current_level");`);

    this.addSql(`create table "user_boosters" ("id" serial primary key, "owner_id" bigint not null, "energy_limit_id" int not null, "click_power_id" int not null);`);
    this.addSql(`create index "user_boosters_owner_id_index" on "user_boosters" ("owner_id");`);
    this.addSql(`alter table "user_boosters" add constraint "user_boosters_owner_id_unique" unique ("owner_id");`);
    this.addSql(`create index "user_boosters_energy_limit_id_index" on "user_boosters" ("energy_limit_id");`);
    this.addSql(`create index "user_boosters_click_power_id_index" on "user_boosters" ("click_power_id");`);

    this.addSql(`create table "referrals" ("id" serial primary key, "referrer_id" bigint not null, "referred_id" bigint not null, "created_at" timestamptz not null);`);
    this.addSql(`create index "referrals_referrer_id_index" on "referrals" ("referrer_id");`);
    this.addSql(`create index "referrals_referred_id_index" on "referrals" ("referred_id");`);

    this.addSql(`create table "referral_actions" ("id" serial primary key, "referral_id" int not null, "action_type" text check ("action_type" in ('sign_up')) not null, "completed_at" timestamptz not null, "reward_amount" int not null);`);

    this.addSql(`create table "task_completions" ("id" serial primary key, "user_id" bigint not null, "task_id" int not null, "completed_at" timestamptz not null, "reward_amount" int not null);`);

    this.addSql(`alter table "characters" add constraint "characters_max_level_id_foreign" foreign key ("max_level_id") references "character_levels" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "character_levels" add constraint "character_levels_character_id_foreign" foreign key ("character_id") references "characters" ("id") on update cascade;`);

    this.addSql(`alter table "users" add constraint "users_level_id_foreign" foreign key ("level_id") references "user_levels" ("id") on update cascade;`);
    this.addSql(`alter table "users" add constraint "users_selected_character_id_foreign" foreign key ("selected_character_id") references "user_characters" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "users" add constraint "users_refered_by_id_foreign" foreign key ("refered_by_id") references "referrals" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "user_characters" add constraint "user_characters_owner_id_foreign" foreign key ("owner_id") references "users" ("id") on update cascade;`);
    this.addSql(`alter table "user_characters" add constraint "user_characters_character_id_foreign" foreign key ("character_id") references "characters" ("id") on update cascade;`);

    this.addSql(`alter table "user_boosters" add constraint "user_boosters_owner_id_foreign" foreign key ("owner_id") references "users" ("id") on update cascade;`);
    this.addSql(`alter table "user_boosters" add constraint "user_boosters_energy_limit_id_foreign" foreign key ("energy_limit_id") references "boosters_energy_limit_levels" ("id") on update cascade;`);
    this.addSql(`alter table "user_boosters" add constraint "user_boosters_click_power_id_foreign" foreign key ("click_power_id") references "boosters_click_power_levels" ("id") on update cascade;`);

    this.addSql(`alter table "referrals" add constraint "referrals_referrer_id_foreign" foreign key ("referrer_id") references "users" ("id") on update cascade;`);
    this.addSql(`alter table "referrals" add constraint "referrals_referred_id_foreign" foreign key ("referred_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "referral_actions" add constraint "referral_actions_referral_id_foreign" foreign key ("referral_id") references "referrals" ("id") on update cascade;`);

    this.addSql(`alter table "task_completions" add constraint "task_completions_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);
    this.addSql(`alter table "task_completions" add constraint "task_completions_task_id_foreign" foreign key ("task_id") references "earn_tasks" ("id") on update cascade;`);
  }

}
