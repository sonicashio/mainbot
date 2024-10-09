const isPopupOpen = useState<boolean>("isAppPopupOpen", () => false);

export function useAppPopup(): {
    isPopupOpen: Ref<boolean, boolean>;
    closePopup: () => void;
} {
    function closePopup(): void {
        isPopupOpen.value = false;
    }

    return {
        isPopupOpen,
        closePopup,
    };
}
