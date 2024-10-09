import type { User } from "~/server/entities/user";

export class LeaderBoardUserDto {
    public telegramId!: number;
    public firstName!: string;
    public lastName?: string | undefined;
    public username?: string | undefined;
    public photoUrl?: string | undefined;
    public profitPerHour!: number;
    public level!: number;
    public rank!: number;

    public static fromUser(user: User, rank: number): LeaderBoardUserDto {
        const dto = new LeaderBoardUserDto();
        dto.telegramId = user.telegramId;
        dto.firstName = user.firstName;
        dto.lastName = user.lastName;
        dto.username = user.username;
        dto.photoUrl = user.photoUrl;
        dto.profitPerHour = user.profitPerHour;
        dto.level = user.level.level;
        dto.rank = rank;
        return dto;
    }
}
