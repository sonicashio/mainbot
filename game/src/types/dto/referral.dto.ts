import type { Referral } from "~/server/entities/referral";

export class ReferralDto {
    public username!: string | undefined;
    public firstName!: string;
    public lastName!: string | undefined;
    public profitPerHour!: number;
    public photoUrl!: string | undefined;

    public static fromReferral(referral: Referral): ReferralDto {
        const dto = new ReferralDto();
        dto.username = referral.referred.username;
        dto.firstName = referral.referred.firstName;
        dto.lastName = referral.referred.lastName;
        dto.profitPerHour = referral.referred.profitPerHour;
        dto.photoUrl = referral.referred.photoUrl;

        return dto;
    }
}
