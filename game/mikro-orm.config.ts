import { Migrator } from "@mikro-orm/migrations";
import type { Options } from "@mikro-orm/postgresql";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { EarnTask } from "./src/server/entities/tasks";
import { ClickPowerLevelBooster, EnergyLimitLevelBooster } from "./src/server/entities/boosters";
import { DailyLoginReward } from "./src/server/entities/rewards";
import { Referral, ReferralAction } from "./src/server/entities/referral";
import { Character, CharacterLevel } from "./src/server/entities/character";
import { User, UserCharacter, UserLevel } from "./src/server/entities/user";
import { Settings } from "~/server/entities/settings";
import { UsersStatics } from "~/server/entities/statics";

const config: Options = {
    driver: PostgreSqlDriver,
    ensureDatabase: false,
    host: process.env["DB_HOST"],
    port: process.env["DB_PORT"] === undefined ? undefined : parseInt(process.env["DB_PORT"]),
    user: process.env["DB_USER"],
    password: process.env["DB_PASSWORD"],
    dbName: process.env["DB_NAME"],
    extensions: [Migrator],
    migrations: {
        path: import.meta.dev ? "./src/server/migrations" : "./server/migrations",
    },

    // folder-based discovery setup, using common filename suffix
    // entities: ["dist/**/*.entity.js"],
    // entitiesTs: ["src/server/entities/**/*.entity.ts"],
    entities: [
        Settings,
        EarnTask,
        EnergyLimitLevelBooster,
        ClickPowerLevelBooster,
        DailyLoginReward,
        ReferralAction,
        Referral,
        CharacterLevel,
        Character,
        UserLevel,
        UserCharacter,
        User,
        UsersStatics,
    ],

    // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
    // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
    // metadataProvider: TsMorphMetadataProvider,

    // enable debug mode to log SQL queries and discovery information
    debug: false,
};

export default config;
