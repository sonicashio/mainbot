/**
 * A wrapper for Nuxt3 `useState` which allows the data
 * to be saved in browser's `localStorage` as JSON.
 * The API is the same as `useState`.
 *
 * @param key A string key
 * @param init A function that provides initial value for the state when it's not initiated
 */

export function useLocalState<T>(key: string, init?: () => T): Ref<T> {
    key = `useLocalState-${key}`;
    let state: Ref<T> = useState<T>(key, init);

    // Server-side
    if (!import.meta.client || localStorage === undefined) {
        state = useState<T>(key, init);
    }

    // Client-side
    else {
        const localItem: string | null = localStorage.getItem(key);
        const savedValue: T | null = localItem !== null ? JSON.parse(localItem) : null;
        if (savedValue !== null) {
            state.value = savedValue;
        }
    }

    // Keep the keys so there are no duplicate watch-ers.
    // The keys also should be only on the client side.
    // Watch only if there are no other watchers
    const keys: Ref<string[]> = useState<string[]>("useLocalState-watch-keys", () => []);
    if (keys.value.includes(key)) {
        return state;
    }

    watch(
        () => state.value,
        (newValue) => {
            if (!import.meta.client || localStorage === undefined) {
                return;
            }

            // clear the state
            if (newValue === undefined) {
                keys.value = keys.value.filter(v => v !== key);
                try {
                    localStorage.removeItem(key);
                }
                catch { /* empty */ }
            }

            // set state
            else {
                keys.value.push(key);
                try {
                    localStorage.setItem(key, JSON.stringify(state.value));
                }
                catch { /* empty */ }
            }
        },
    );

    return state;
}
