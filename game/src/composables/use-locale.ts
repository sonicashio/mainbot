export async function useLocale(): Promise<Ref<string>> {
    const i18n = useI18n();
    const state: Ref<string> = useLocalState<string>("locale", () => {
        return i18n.locale.value;
    });

    await i18n.setLocale(state.value);

    return computed<string>({
        get(): string {
            return state.value;
        },
        async set(newValue: string): Promise<void> {
            state.value = newValue;
            await i18n.setLocale(newValue);
        },
    });
}
