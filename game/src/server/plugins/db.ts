import type { NitroApp } from "nitropack";
import type { MikroORM } from "@mikro-orm/postgresql";
import mikroOrmConfig from "../../../mikro-orm.config";
import { EnergyLimitBoosterService, clickPowerLevelBoosterService as ClickPowerLevelBoosterService } from "~/server/services/boosters";
import { CharacterService } from "~/server/services/character";
import { ReferralActionService, ReferralService } from "~/server/services/referral";
import { UserCharacterService, UserLevelService, UserBoosterService, UserService } from "~/server/services/user";
import { DailyLoginService } from "~/server/services/rewards";
import { EarnTaskService } from "~/server/services/tasks";
import { EnergyLimitLevelBooster, ClickPowerLevelBooster } from "~/server/entities/boosters";
import { DailyLoginReward } from "~/server/entities/rewards";
import { EarnTask } from "~/server/entities/tasks";
import { CharacterLevel, Character } from "~/server/entities/character";
import { User, UserLevel, UserRole } from "~/server/entities/user";
import { EarnTaskType } from "~/types";
import { SettingsService } from "~/server/services";
import { Settings } from "~/server/entities/settings";

async function setup(orm: MikroORM): Promise<void> {
    // # Test Dataset
    const emFork = orm.em.fork();
    const earnTaskService = new EarnTaskService(emFork);
    const energyLimitBoosterService = new EnergyLimitBoosterService(emFork);
    const clickPowerLevelBoosterService = new ClickPowerLevelBoosterService(emFork);
    const dailyLoginService = new DailyLoginService(emFork);
    const characterService = new CharacterService(emFork);
    const userLevelService = new UserLevelService(emFork);

    console.info("Settings");
    const settingsService = new SettingsService(emFork);
    await settingsService.create(new Settings());

    console.info("Earn Task");
    await earnTaskService.create(new EarnTask(
        "Join TG channel",
        EarnTaskType.TELEGRAM_JOIN,
        25_000,
        { url: "https://t.me/Sonicashh" },
    ));
    await earnTaskService.create(new EarnTask(
        "Follow X account",
        EarnTaskType.X_FOLLOW,
        25_000,
        { url: "https://x.com/Sonicash_io" },
    ));
    await earnTaskService.create(new EarnTask(
        "Subscribe YouTube",
        EarnTaskType.YOUTUBE_SUBSCRIBE,
        25_000,
        { url: "https://www.youtube.com/@sonicash_bot" },
    ));
    await earnTaskService.create(new EarnTask(
        "Invite 1 friend",
        EarnTaskType.INVITE_FRIENDS,
        25_000,
        { count: 1 },
    ));
    await earnTaskService.create(new EarnTask(
        "Invite 3 friend",
        EarnTaskType.INVITE_FRIENDS,
        150_000,
        { count: 3 },
    ));

    console.info("EnergyLimit Boosters");
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(0, 0));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(1, 1_000));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(2, 2_000));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(3, 5_000));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(4, 10_000));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(5, 20_000));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(6, 50_000));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(7, 100_000));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(8, 200_000));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(9, 500_000));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(10, 1_000_000));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(11, 2_000_000));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(12, 3_000_000));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(13, 4_000_000));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(14, 5_000_000));
    await energyLimitBoosterService.create(new EnergyLimitLevelBooster(15, 10_000_000));

    console.info("ClickPower Boosters");
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(0, 0));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(1, 1_000));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(2, 2_000));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(3, 5_000));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(4, 10_000));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(5, 20_000));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(6, 50_000));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(7, 100_000));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(8, 200_000));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(9, 500_000));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(10, 1_000_000));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(11, 2_000_000));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(12, 3_000_000));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(13, 4_000_000));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(14, 5_000_000));
    await clickPowerLevelBoosterService.create(new ClickPowerLevelBooster(15, 10_000_000));

    console.info("Daily Login");
    await dailyLoginService.create(new DailyLoginReward(1, 1_000, false));
    await dailyLoginService.create(new DailyLoginReward(2, 2_000, false));
    await dailyLoginService.create(new DailyLoginReward(3, 4_000, false));
    await dailyLoginService.create(new DailyLoginReward(4, 20_000, true));
    await dailyLoginService.create(new DailyLoginReward(5, 14_000, false));
    await dailyLoginService.create(new DailyLoginReward(6, 20_000, false));
    await dailyLoginService.create(new DailyLoginReward(7, 28_000, false));
    await dailyLoginService.create(new DailyLoginReward(8, 80_000, true));
    await dailyLoginService.create(new DailyLoginReward(9, 42_000, false));
    await dailyLoginService.create(new DailyLoginReward(10, 54_000, false));
    await dailyLoginService.create(new DailyLoginReward(11, 72_000, false));
    await dailyLoginService.create(new DailyLoginReward(12, 200_000, true));

    // Characters
    console.info("Characters");
    const characters = [
        await characterService.create(new Character(1, "Sonic", 0), 0),
        await characterService.create(new Character(2, "Athlete Sonic", 1_000), 7_000),
        await characterService.create(new Character(3, "Warrior Sonic", 4_000), 33_000),
        await characterService.create(new Character(4, "Pirate Sonic", 30_000), 150_000),
        await characterService.create(new Character(5, "Hero Sonic", 100_000), 385_000),
        await characterService.create(new Character(6, "Samurai Sonic", 500_000), 750_000),
        await characterService.create(new Character(7, "Astronaut Sonic", 750_000), 1_215_000),
        await characterService.create(new Character(8, "Doctor Sonic", 1_000_000), 1_845_000),
        await characterService.create(new Character(9, "Lawyer Sonic", 3_000_000), 2_695_000),
        await characterService.create(new Character(10, "Officer Sonic", 5_000_000), 3_590_000),
    ];

    // Character Levels
    console.info("Character Levels");
    // character1
    {
        const levels = [
            new CharacterLevel(characters[0], 1, 100, 50, 50),
            new CharacterLevel(characters[0], 2, 500, 150, 100),
            new CharacterLevel(characters[0], 3, 1_000, 300, 150),
            new CharacterLevel(characters[0], 4, 2_000, 500, 200),
            new CharacterLevel(characters[0], 5, 4_000, 1_100, 600),
            new CharacterLevel(characters[0], 6, 8_000, 2_000, 900),
            new CharacterLevel(characters[0], 7, 16_000, 7_000, 5_000),
        ];
        await characterService.addLevels(characters[0], levels);
    }

    // character2
    {
        const levels = [
            new CharacterLevel(characters[1], 1, 2_000, 7_300, 300),
            new CharacterLevel(characters[1], 2, 4_000, 7_900, 600),
            new CharacterLevel(characters[1], 3, 8_000, 8_800, 900),
            new CharacterLevel(characters[1], 4, 16_000, 10_000, 1_200),
            new CharacterLevel(characters[1], 5, 32_000, 13_000, 3_000),
            new CharacterLevel(characters[1], 6, 64_000, 18_000, 5_000),
            new CharacterLevel(characters[1], 7, 100_000, 33_000, 15_000),
        ];
        await characterService.addLevels(characters[1], levels);
    }

    // character3
    {
        const levels = [
            new CharacterLevel(characters[2], 1, 15_000, 37_000, 4_000),
            new CharacterLevel(characters[2], 2, 30_000, 42_000, 5_000),
            new CharacterLevel(characters[2], 3, 60_000, 52_000, 10_000),
            new CharacterLevel(characters[2], 4, 120_000, 64_000, 12_000),
            new CharacterLevel(characters[2], 5, 250_000, 80_000, 16_000),
            new CharacterLevel(characters[2], 6, 500_000, 100_000, 20_000),
            new CharacterLevel(characters[2], 7, 1_000_000, 150_000, 50_000),
        ];
        await characterService.addLevels(characters[2], levels);
    }

    // character4
    {
        const levels = [
            new CharacterLevel(characters[3], 1, 100_000, 160_000, 10_000),
            new CharacterLevel(characters[3], 2, 200_000, 175_000, 15_000),
            new CharacterLevel(characters[3], 3, 350_000, 195_000, 20_000),
            new CharacterLevel(characters[3], 4, 500_000, 220_000, 25_000),
            new CharacterLevel(characters[3], 5, 1_000_000, 250_000, 30_000),
            new CharacterLevel(characters[3], 6, 1_500_000, 285_000, 35_000),
            new CharacterLevel(characters[3], 7, 2_000_000, 385_000, 100_000),
        ];
        await characterService.addLevels(characters[3], levels);
    }

    // character5
    {
        const levels = [
            new CharacterLevel(characters[4], 1, 300_000, 395_000, 10_000),
            new CharacterLevel(characters[4], 2, 500_000, 410_000, 15_000),
            new CharacterLevel(characters[4], 3, 750_000, 430_000, 20_000),
            new CharacterLevel(characters[4], 4, 1_000_000, 460_000, 30_000),
            new CharacterLevel(characters[4], 5, 2_000_000, 500_000, 40_000),
            new CharacterLevel(characters[4], 6, 3_000_000, 550_000, 50_000),
            new CharacterLevel(characters[4], 7, 4_000_000, 750_000, 200_000),
        ];
        await characterService.addLevels(characters[4], levels);
    }

    // character6
    {
        const levels = [
            new CharacterLevel(characters[5], 1, 750_000, 770_000, 20_000),
            new CharacterLevel(characters[5], 2, 1_000_000, 795_000, 25_000),
            new CharacterLevel(characters[5], 3, 2_000_000, 830_000, 35_000),
            new CharacterLevel(characters[5], 4, 3_000_000, 870_000, 40_000),
            new CharacterLevel(characters[5], 5, 4_000_000, 915_000, 45_000),
            new CharacterLevel(characters[5], 6, 5_000_000, 965_000, 50_000),
            new CharacterLevel(characters[5], 6, 6_000_000, 1_215_000, 250_000),
        ];
        await characterService.addLevels(characters[5], levels);
    }

    // character7
    {
        const levels = [
            new CharacterLevel(characters[6], 1, 2_000_000, 1_245_000, 30_000),
            new CharacterLevel(characters[6], 2, 3_000_000, 1_285_000, 40_000),
            new CharacterLevel(characters[6], 3, 4_000_000, 1_335_000, 50_000),
            new CharacterLevel(characters[6], 4, 5_000_000, 1_395_000, 60_000),
            new CharacterLevel(characters[6], 5, 6_000_000, 1_465_000, 70_000),
            new CharacterLevel(characters[6], 6, 7_000_000, 1_545_000, 80_000),
            new CharacterLevel(characters[6], 7, 8_000_000, 1_845_000, 300_000),
        ];
        await characterService.addLevels(characters[6], levels);
    }

    // character8
    {
        const levels = [
            new CharacterLevel(characters[7], 1, 4_000_000, 1_895_000, 50_000),
            new CharacterLevel(characters[7], 2, 5_000_000, 1_955_000, 60_000),
            new CharacterLevel(characters[7], 3, 6_000_000, 2_025_000, 70_000),
            new CharacterLevel(characters[7], 4, 7_000_000, 2_105_000, 80_000),
            new CharacterLevel(characters[7], 5, 8_000_000, 2_195_000, 90_000),
            new CharacterLevel(characters[7], 6, 9_000_000, 2_295_000, 100_000),
            new CharacterLevel(characters[7], 7, 10_000_000, 2_695_000, 400_000),
        ];
        await characterService.addLevels(characters[7], levels);
    }

    // character9
    {
        const levels = [
            new CharacterLevel(characters[8], 1, 6_000_000, 2_755_000, 60_000),
            new CharacterLevel(characters[8], 2, 7_000_000, 2_825_000, 70_000),
            new CharacterLevel(characters[8], 3, 8_000_000, 2_905_000, 80_000),
            new CharacterLevel(characters[8], 4, 9_000_000, 2_995_000, 90_000),
            new CharacterLevel(characters[8], 5, 10_000_000, 3_090_000, 95_000),
            new CharacterLevel(characters[8], 6, 11_000_000, 3_190_000, 100_000),
            new CharacterLevel(characters[8], 7, 12_000_000, 3_590_000, 400_000),
        ];
        await characterService.addLevels(characters[8], levels);
    }

    // character10
    {
        const levels = [
            new CharacterLevel(characters[9], 1, 10_000_000, 3_660_000, 70_000),
            new CharacterLevel(characters[9], 2, 12_000_000, 3_740_000, 80_000),
            new CharacterLevel(characters[9], 3, 14_000_000, 3_830_000, 90_000),
            new CharacterLevel(characters[9], 4, 16_000_000, 3_930_000, 100_000),
            new CharacterLevel(characters[9], 5, 18_000_000, 4_050_000, 120_000),
            new CharacterLevel(characters[9], 6, 20_000_000, 4_200_000, 150_000),
            new CharacterLevel(characters[9], 7, 25_000_000, 4_800_000, 600_000),
        ];
        await characterService.addLevels(characters[9], levels);
    }

    // User Levels
    console.info("Levels");
    await userLevelService.create(new UserLevel(0, "Level 0", 0, 0, 0));
    await userLevelService.create(new UserLevel(1, "Level 1", 0, 5_000, 0));
    await userLevelService.create(new UserLevel(2, "Level 2", 0, 20_000, 0));
    await userLevelService.create(new UserLevel(3, "Level 3", 0, 50_000, 0));
    await userLevelService.create(new UserLevel(4, "Level 4", 0, 100_000, 0));
    await userLevelService.create(new UserLevel(5, "Level 5", 0, 500_000, 0));
    await userLevelService.create(new UserLevel(6, "Level 6", 0, 1_000_000, 0));
    await userLevelService.create(new UserLevel(7, "Level 7", 0, 5_000_000, 0));
    await userLevelService.create(new UserLevel(8, "Level 8", 0, 20_000_000, 0));
    await userLevelService.create(new UserLevel(9, "Level 9", 0, 50_000_000, 0));
    await userLevelService.create(new UserLevel(10, "Level 10", 0, 250_000_000, 0));

    // Users
    console.info("Users");
    const userBoosterService = new UserBoosterService(emFork);
    const userService = new UserService(
        emFork,
        new SettingsService(emFork),
        userBoosterService,
        new ReferralService(emFork),
        new ReferralActionService(emFork),
        new UserCharacterService(emFork),
    );
    // await userService.create(589406119, "Egypt", "Islam", "Nofl", "CorrM", undefined, undefined);
    // await userService.create(101010101, "Egypt", "Test", "Test", "Test", undefined, undefined);

    const adminUser = await userService.create(5345697807, "Egypt", "Fady", undefined, undefined, undefined, undefined);
    userService.setRole(adminUser, UserRole.ADMIN);
    await userService.update(adminUser);

    for (let i = 0; i < 50; i++) {
        await userService.create(2900 + i, "Egypt", `user${i}`, `user${i}`, `user${i}`, undefined, "589406119");
    }

    /*
    {
        const referral = new Referral(user1, user2);
        user1.referrals.add(referral);

        const action = new ReferralAction(referral, ReferralActionType.SIGN_UP, 5000);
        await referral.addAction(emFork, action);
    }

    {
        const referral = new Referral(user1, user3);
        user1.referrals.add(referral);

        const action = new ReferralAction(referral, ReferralActionType.SIGN_UP, 5000);
        await referral.addAction(emFork, action);
    }
    */

    // Clear Test data tracker
    emFork.clear();

    console.info("DB initialized");
}

export default defineNitroPlugin(async (nitroApp: NitroApp) => {
    console.info("Connect to DB");
    const orm = await registerGlobalOrm<MikroORM>(nitroApp, mikroOrmConfig);

    console.info("Check DB");
    const databaseCreated: boolean = await orm.schema.ensureDatabase({ create: true, forceCheck: true });
    if (databaseCreated) {
        console.info("Setup DB");
        await setup(orm);
    }

    if (import.meta.dev) {
        if (!databaseCreated) {
            console.info("Refresh Database");
            await orm.schema.refreshDatabase();

            console.info("Setup DB");
            await setup(orm);
        }
    } else {
        console.info("Migrate Database to latest version");
        await orm.migrator.up();
    }

    console.info("DB connected");
});
