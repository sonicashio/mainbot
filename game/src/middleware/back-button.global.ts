export default defineNuxtRouteMiddleware(async (to, _from) => {
    const { useWebAppBackButton } = await import("vue-tg");
    const { isBackButtonVisible, showBackButton, hideBackButton } = useWebAppBackButton();

    if (isBackButtonVisible.value && (to.path === "/app" || to.path === "/app/")) {
        hideBackButton();
        return;
    } else if (!isBackButtonVisible.value) {
        showBackButton();
    }
});
