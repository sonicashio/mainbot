import type { UserLevel } from "~/server/entities/user";

export class UserLevelDto {
    public level!: number;
    public name!: string;
    public balanceReward!: number;
    public requiredBalance!: number;
    public profitPerHour!: number;

    public static fromUserLevel(level: UserLevel): UserLevelDto {
        const dto = new UserLevelDto();
        dto.level = level.level;
        dto.name = level.name;
        dto.balanceReward = level.balanceReward;
        dto.requiredBalance = level.requiredBalance;
        dto.profitPerHour = level.profitPerHour;
        return dto;
    }
}
