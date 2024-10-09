import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { UserBoosterService, UserCharacterService, UserService } from "~/server/services/user";
import { SettingsService } from "~/server/services";
import { ReferralActionService, ReferralService } from "~/server/services/referral";
import { UserRole } from "~/types";

const userSchema = z.object({
    id: z.number().min(0, { message: "Invalid ID" }),
    isBanned: z.boolean(),
    photoUrl: z.union([z.string().length(0), z.string().url("Invalid URL")]).nullable().optional(),
    role: z.nativeEnum(UserRole, { errorMap: () => ({ message: "Invalid role" }) }),
    selectedCharacterRank: z.number().min(0, "Character rank must be 0 or greater"),
    balance: z.number().min(0, "Balance must be 0 or greater"),
    energy: z.number().min(0, "Energy must be 0 or greater"),
    dailyEnergyReplenishmentUsed: z.number().min(0, "Daily energy replenishment used must be 0 or greater"),
});

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const bodyResult = userSchema.safeParse(await readBody(event));
    if (!bodyResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid body parameters",
            data: bodyResult.error,
        });
    }

    const body = bodyResult.data;
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

    const userToEdit: User | null = await em.findOne(User, { id: body.id });
    if (userToEdit === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    if (user.role !== UserRole.ADMIN && userToEdit.role === UserRole.ADMIN) {
        throw createError({
            statusCode: 403,
            statusMessage: "Can't edit admin",
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

    // Ban
    if (userToEdit.role === UserRole.ADMIN && body.isBanned) {
        throw createError({
            statusCode: 403,
            statusMessage: "Can't ban admin",
        });
    }

    if (user.role === UserRole.MODERATOR && userToEdit.role === UserRole.MODERATOR && body.isBanned) {
        throw createError({
            statusCode: 403,
            statusMessage: "Can't ban moderator",
        });
    }

    userService.setBanned(userToEdit, body.isBanned);

    // Photo
    userService.setPhotoUrl(userToEdit, body.photoUrl ?? "");

    // Role
    if (userToEdit.role === UserRole.ADMIN && body.role !== UserRole.ADMIN) {
        throw createError({
            statusCode: 403,
            statusMessage: "Cant change admin role",
        });
    }

    if (user.role === UserRole.MODERATOR && userToEdit.role === UserRole.MODERATOR && body.role !== UserRole.MODERATOR) {
        throw createError({
            statusCode: 403,
            statusMessage: "Cant change moderator role",
        });
    }

    userService.setRole(userToEdit, body.role);

    // Character rank
    await userService.selectCharacter(userToEdit, body.selectedCharacterRank);

    // Balance
    userService.setBalance(userToEdit, body.balance);

    // Energy
    userService.setEnergy(userToEdit, body.energy);

    // Daily energy replenishment used
    await userService.setDailyEnergyReplenishmentUsed(userToEdit, body.dailyEnergyReplenishmentUsed);

    await userService.update(userToEdit);

    return { success: true };
});
