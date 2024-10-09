import type { UserRole } from "./types";

declare module "#auth-utils" {
    interface User {
        telegramId: number;
        role: UserRole;
        serverVersion: number;
    }

    interface UserSession {
        user: User;
        extended?: unknown;
        loggedInAt: Date;
    }
}

export {};
