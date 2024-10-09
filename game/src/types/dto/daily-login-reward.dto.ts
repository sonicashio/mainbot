import type { DailyLoginReward } from "~/server/entities/rewards";

export class DailyLoginRewardDto {
    public day!: number;
    public reward!: number;
    public spcialDay!: boolean;

    public static fromDailyLoginReward(dailyLoginReward: DailyLoginReward): DailyLoginRewardDto {
        const dto = new DailyLoginRewardDto();
        dto.day = dailyLoginReward.day;
        dto.reward = dailyLoginReward.reward;
        dto.spcialDay = dailyLoginReward.spcialDay;

        return dto;
    }
}
