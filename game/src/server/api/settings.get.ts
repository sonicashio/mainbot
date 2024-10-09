import type { EntityManager } from "@mikro-orm/postgresql";
import { SettingsService } from "~/server/services";
import { User } from "~/server/entities/user";
import type { Settings } from "~/server/entities/settings";
import { SettingsDto } from "~/types/dto";

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

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

    const settingsService = new SettingsService(em);
    const settings: Settings = await settingsService.get();

    return SettingsDto.fromSettings(settings);
});
