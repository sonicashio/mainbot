import type { EntityManager } from "@mikro-orm/postgresql";
import { UserLevelDto } from "./user-level.dto";
import type { User, UserLevel } from "~/server/entities/user";
import type { UserRole } from "~/types/user-role";

export class UserDto {
    public id!: number;
    public telegramId!: number;
    public firstName!: string;
    public lastName!: string | null;
    public username!: string | null;
    public photoUrl!: string | null;
    public role!: UserRole;
    public isBanned!: boolean;
    public createdAt!: number;
    public level!: UserLevelDto;
    public nextLevel!: UserLevelDto | null;
    public selectedCharacterRank!: number;
    public balance!: number;
    public balancePerClick!: number;
    public totalClicks!: number;
    public profitPerHour!: number;
    public totalReferralRewards!: number;
    public referrals!: number;
    public energy!: number;
    public energyLimit!: number;
    public dailyEnergyReplenishmentClaimedDayTime?: number;
    public dailyEnergyReplenishmentUsed!: number;
    public lastLoginRewardDay!: number;
    public canClaimLoginReward!: boolean;
    public canClaimDailyReward!: boolean;

    public static async fromUser(em: EntityManager, user: User, nextUserLevel: UserLevel | null): Promise<UserDto> {
        await em.populate(user, ["level", "selectedCharacter.character"]);

        if (user.level === undefined) {
            throw new Error("User level not loaded");
        }

        if (user.selectedCharacter === undefined) {
            throw new Error("User selected character not loaded");
        }

        if (user.selectedCharacter.character === undefined) {
            throw new Error("User selected character info not loaded");
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTime: number = today.getTime();

        const dto = new UserDto();
        dto.id = user.id;
        dto.telegramId = user.telegramId;
        dto.firstName = user.firstName;
        dto.lastName = user.lastName ?? null;
        dto.username = user.username ?? null;
        dto.photoUrl = user.photoUrl ?? null;
        dto.role = user.role;
        dto.isBanned = user.isBanned;
        dto.createdAt = user.createdAt.getTime();
        dto.level = UserLevelDto.fromUserLevel(user.level);
        dto.nextLevel = nextUserLevel === null ? null : UserLevelDto.fromUserLevel(nextUserLevel);
        dto.selectedCharacterRank = user.selectedCharacter.character.rank;
        dto.balance = user.balance;
        dto.balancePerClick = user.balancePerClick;
        dto.totalClicks = user.totalClicks;
        dto.profitPerHour = user.profitPerHour;
        dto.totalReferralRewards = user.totalReferralRewards;
        dto.referrals = await user.referrals.loadCount();
        dto.energy = user.energy;
        dto.energyLimit = user.energyLimit;
        dto.dailyEnergyReplenishmentClaimedDayTime = user.dailyEnergyReplenishmentClaimedDayTime;
        dto.dailyEnergyReplenishmentUsed = user.dailyEnergyReplenishmentUsed;
        dto.lastLoginRewardDay = user.lastLoginRewardDay;
        dto.canClaimLoginReward = user.lastDailyLoginClaimedDayTime !== todayTime;
        dto.canClaimDailyReward = user.lastDailyRewardClaimTime !== todayTime;
        return dto;
    }
}
