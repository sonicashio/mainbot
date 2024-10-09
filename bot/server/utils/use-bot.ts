import { Bot } from "grammy";

let bot: Bot | undefined = undefined;

export function useTelegramBot(): Bot {
    if (bot === undefined) {
        if (process.env["TELEGRAM_BOT_TOKEN"] === undefined) {
            throw new Error("TELEGRAM_BOT_TOKEN is not defined");
        }

        bot = new Bot(process.env["TELEGRAM_BOT_TOKEN"]);
    }

    return bot;
}
