import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User, UserLevel } from "~/server/entities/user";
import { UserCharacterService, UserService } from "~/server/services/user";
import { ReferralActionService, ReferralService } from "~/server/services/referral";
import { UserBoosterService } from "~/server/services/user/user-booster.service";
import { UserDto } from "~/types/dto/user";
import { SettingsService } from "~/server/services";

const bodySchema = z.object({
    clicks: z.coerce.number().min(0),
    time: z.coerce.number().min(0), // This just for give the user some time if the request is too slow
});

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const bodyResult = bodySchema.safeParse(await readBody(event));
    if (!bodyResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid body parameters",
            data: bodyResult.error,
        });
    }

    const em: EntityManager = useEntityManager<EntityManager>(event);
    const user: User | null = await em.findOne(User, { telegramId: session.user.telegramId }, { populate: ["level"] });
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

    const body = bodyResult.data;
    const userService = new UserService(
        em,
        new SettingsService(em),
        new UserBoosterService(em),
        new ReferralService(em),
        new ReferralActionService(em),
        new UserCharacterService(em),
    );

    const syncData: string | { balanceFromClicks: number | string; profit: number } = await userService.syncEnergyAndClicksAndProfit(
        user,
        body.clicks,
        body.time,
    );
    if (typeof syncData === "string") {
        throw createError({
            statusCode: 400,
            statusMessage: syncData,
        });
    }

    const nextLevelNumber: number = user.level.level + 1;
    const nextLevel: UserLevel | null = await em.findOne(
        UserLevel,
        { level: nextLevelNumber },
        { cache: [`user_level_${nextLevelNumber}`, 600_000] },
    );
    const userDto: UserDto = await UserDto.fromUser(em, user, nextLevel);

    return {
        clicksStatus: typeof syncData.balanceFromClicks === "number" ? "valid" : syncData.balanceFromClicks,
        addedProfit: syncData.profit,
        addedBalance: syncData.balanceFromClicks,
        user: userDto,
    };
});
