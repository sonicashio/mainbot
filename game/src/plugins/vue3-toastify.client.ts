import Vue3Toastify, { toast, type ToastContainerOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export default defineNuxtPlugin((nuxtApp) => {
    const options: ToastContainerOptions = {
        autoClose: 3000,
        position: "top-center",
        theme: "dark",
        pauseOnFocusLoss: false,
        transition: "zoom",
        limit: 3,
        newestOnTop: true,
    };
    nuxtApp.vueApp.use(Vue3Toastify, options);

    return {
        provide: { toast },
    };
});
