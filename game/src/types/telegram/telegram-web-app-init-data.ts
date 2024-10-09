import type { TelegramWebAppChat } from "./telegram-web-app-chat";
import type { TelegramWebAppUser } from "./telegram-web-app-user";

export interface TelegramWebAppInitData {
    query_id?: string;
    user?: TelegramWebAppUser;
    receiver?: TelegramWebAppUser;
    chat?: TelegramWebAppChat;
    chat_type?: string;
    chat_instance?: string;
    start_param?: string;
    can_send_after?: number;
    auth_date: string;
    hash: string;
}
