import type { EntityManager } from "@mikro-orm/postgresql";
import { z } from "zod";
import { User } from "~/server/entities/user";
import { SettingsService } from "~/server/services";
import { ReferralActionService, ReferralService } from "~/server/services/referral";
import { UserBoosterService, UserCharacterService, UserService } from "~/server/services/user";
import { UserRole } from "~/types";

const idsSchema = z.array(z.number().min(0, { message: "Invalid ID" }));

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const bodyResult = idsSchema.safeParse(await readBody(event));
    if (!bodyResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid body parameters",
            data: bodyResult.error,
        });
    }

    const body: number[] = bodyResult.data;
    const em: EntityManager = useEntityManager<EntityManager>(event);

    const user: User | null = await em.findOne(User, { telegramId: session.user.telegramId });
    if (user === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "Current user not found",
        });
    }

    if (user.isBanned) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is banned",
        });
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is not an admin",
        });
    }

    const usersToBan: User[] = await em.find(User, { id: { $in: body } });
    if (usersToBan.length !== body.length) {
        throw createError({
            statusCode: 404,
            statusMessage: "Some users not found",
        });
    }

    const userService = new UserService(
        em,
        new SettingsService(em),
        new UserBoosterService(em),
        new ReferralService(em),
        new ReferralActionService(em),
        new UserCharacterService(em),
    );

    // Don't ever delete user, just ban them
    for (const userToBan of usersToBan) {
        if (userToBan.role === UserRole.ADMIN) {
            throw createError({
                statusCode: 403,
                statusMessage: "Can't ban admin",
            });
        } else if (user.role !== UserRole.ADMIN && userToBan.role === UserRole.MODERATOR) {
            throw createError({
                statusCode: 403,
                statusMessage: "Can't ban moderator",
            });
        }

        userService.setBanned(userToBan, true);
    }

    await em.flush();

    return { success: true };
});
