import { toast } from "vue3-toastify";
import type { SettingsDto } from "~/types/dto";

const settings = useState<SettingsDto | null>("settings", () => null);

/**
 * Get app settings
 *
 * @note returned settings will be null only in login page, otherwise it will be filled
*/
export function useSettings(): {
    settings: Ref<SettingsDto | null>;
    fetch: () => Promise<void>;
} {
    async function fetch(): Promise<void> {
        try {
            const data = await $fetch("/api/settings");
            settings.value = data;
        } catch {
            settings.value = null;
            toast.error("Failed to fetch settings");
        }
    }

    return {
        settings,
        fetch,
    };
}
