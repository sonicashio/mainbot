import { Bot, GrammyError } from "grammy";
import { ChatMember } from "grammy/types";
import { z } from "zod";

const querySchema = z.object({
    chat_id: z.string().or(z.number()),
    user_id: z.coerce.number(),
});

export default defineEventHandler(async (event) => {
    const queryResult = querySchema.safeParse(getQuery(event));
    if (queryResult.error) {
        throw createError({
            statusCode: 400,
            statusMessage: queryResult.error.message,
        });
    }

    const bot: Bot = useTelegramBot();
    let errorText: string | undefined = undefined;
    try {
        const member: ChatMember = await bot.api.getChatMember(queryResult.data.chat_id, queryResult.data.user_id);
        if (member.status === "member" || member.status === "creator" || member.status === "administrator") {
            return { success: true };
        }
    } catch (error) {
        if (error instanceof GrammyError) {
            errorText = error.description;
        }

        console.error(error);
    }

    return { success: false, error: errorText };
});
