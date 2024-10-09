import { NitroApp } from "nitropack";
import { Bot, InlineKeyboard } from "grammy";

const HELLO_MESSAGE: string = "Welcome to Sonicash! 🚀\nJoin us on an exciting journey where your social media activity is rewarded with real value. Complete missions, earn rewards, and unlock exclusive opportunities in the world of blockchain.\nBut that’s not all! Sonicash is more than just rewards. We’re a thriving community where entrepreneurs, startups, and investors come together to make a real impact. Whether you’re looking to promote your project or explore strategic partnerships, Sonicash is here to help you grow. Let’s collaborate, innovate, and succeed together!\nWelcome aboard! 🌟";

export default defineNitroPlugin((_nitroApp: NitroApp) => {
    const bot: Bot = useTelegramBot();
    bot.catch(error => console.error(error));

    bot.on("message", async (ctx) => {
        const keyboard = new InlineKeyboard()
            .url("Play 🪙", "https://t.me/s0nicash_bot/start").row()
            .url("Join to the channel", "https://t.me/Sonicashh").row();

        await bot.api.sendMessage(ctx.chatId, HELLO_MESSAGE, {
            reply_markup: keyboard,
        });
    });

    bot.start().catch(error => console.error(error));
});
