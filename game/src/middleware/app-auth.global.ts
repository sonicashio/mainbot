import { toast } from "vue3-toastify";

export default defineNuxtRouteMiddleware(async (to, _from) => {
    const { user, logout } = useUser();
    const { loggedIn, user: usersession } = useUserSession();
    const { version } = useRuntimeConfig().public;

    if ((!loggedIn.value || user.value === null) && to.path !== "/dashboard/login" && to.path.startsWith("/dashboard")) {
        return navigateTo("/dashboard/login");
    }

    if (to.path.startsWith("/dashboard")) {
        return;
    }

    if ((!loggedIn.value || user.value === null) && to.path !== "/app/login") {
        return navigateTo("/app/login");
    }

    // if (loggedIn.value && to.path !== "/app/login" && useRequestURL().hash?.startsWith("#tgWebAppData")) {
    //     console.warn("Relogin");
    //     await logout();
    // }

    if (loggedIn.value && usersession.value?.serverVersion === undefined) {
        await logout();
    } else if (loggedIn.value && usersession.value?.serverVersion !== version) {
        toast.error("Server version mismatch. Will log you out.");
        await logout();
    }
});
