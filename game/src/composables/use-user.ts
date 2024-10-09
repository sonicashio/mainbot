import { toast } from "vue3-toastify";
import type { User } from "#auth-utils";
import type { UserDto } from "~/types/dto/user/user.dto";

/**
 * Get the current user
 *
 * @note returned user will be null only in login page, otherwise it will be filled
*/
export function useUser(): {
    user: Ref<UserDto | null>;
    userSession: Ref<User | null>;
    profitSinceLastSync: Ref<number>;
    fetch: () => Promise<void>;
    sync: (clicks: number) => Promise<boolean>;
    logout: () => Promise<void>;
} {
    const { user: userSession, fetch: fetchSession, clear: clearSession } = useUserSession();
    const user: Ref<UserDto | null> = useState("user", () => null);
    const profitSinceLastSync: Ref<number> = useState("offlineProfit", () => 0);

    async function logout(): Promise<void> {
        user.value = null;
        await clearSession();
        await navigateTo("/app/login");
    }

    async function fetch(): Promise<void> {
        await fetchSession();

        try {
            const data = await $fetch("/api/user/me");
            user.value = data.user;
            profitSinceLastSync.value = data.profitSinceLastSync;
        } catch {
            await logout();
            await navigateTo("/app/login");
        }
    }

    async function sync(clicks: number): Promise<boolean> {
        try {
            const response = await $fetch("/api/user/sync", {
                method: "POST",
                body: {
                    clicks,
                    time: Date.now(),
                },
            });

            user.value = response.user;
        } catch (error) {
            toast.error("Failed to sync user data: " + getErrorMsg(error));
            return false;
        }

        return true;
    }

    return {
        user,
        userSession,
        profitSinceLastSync: profitSinceLastSync,
        fetch,
        sync,
        logout,
    };
}
