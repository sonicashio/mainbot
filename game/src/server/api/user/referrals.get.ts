import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { Referral } from "~/server/entities/referral";
import { ReferralDto } from "~/types/dto";
import { SettingsService } from "~/server/services";
import type { Settings } from "~/server/entities/settings";

const LIST_LIMIT: number = 10;

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const em: EntityManager = useEntityManager<EntityManager>(event);
    const user: User | null = await em.findOne(User, { telegramId: session.user.telegramId });
    if (user === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    if (user.isBanned) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is banned",
        });
    }

    const referrals: Referral[] = await em.find(
        Referral,
        { referrer: user },
        {
            populate: ["referred"],
            limit: LIST_LIMIT,
            orderBy: { referred: { profitPerHour: "DESC" } },
            cache: 120_000, // 2 minutes
        },
    );

    const settingsService = new SettingsService(em);
    const settings: Settings = await settingsService.get();

    return {
        referralReward: settings.referralReward,
        referrals: referrals.map((referral: Referral) => ReferralDto.fromReferral(referral)),
    };
});
