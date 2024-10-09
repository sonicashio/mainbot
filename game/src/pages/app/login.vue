<script lang="ts" setup>
import { toast } from "vue3-toastify";

definePageMeta({
    layout: "app-default",
});

let isSupportedPlatform: Ref<boolean>;
let initData: string;
if (import.meta.dev) {
    isSupportedPlatform = ref<boolean>(true);
    initData = "user=%7B%22id%22%3A589406119%2C%22first_name%22%3A%22Islam%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22CorrM%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&chat_instance=6612578046281554876&chat_type=sender&auth_date=1727400171&hash=a92c7816c3d4534a8871d55714907dcaa8d1b35402c2d2b4f67e17214dd9a8d2";
} else {
    const { useWebApp } = await import("vue-tg");
    const { initData: data, isPlatform } = useWebApp();

    isSupportedPlatform = ref<boolean>(isPlatform("android") || isPlatform("android_x") || isPlatform("ios"));
    initData = data;
}

const error = ref<string | undefined>(undefined);
if (isSupportedPlatform.value && initData) {
    await useLazyFetch("/api/auth/login", {
        method: "POST",
        body: {
            tgInitData: initData,
        },
        onResponse: async (ctx) => {
            // Bug on Nuxt that even its error response `onResponse` called before `onResponseError`
            if (!ctx.response.ok) {
                return;
            }

            const { fetch: fetchUser } = useUser();
            const { fetch: fetchSettings } = useSettings();

            await Promise.all([fetchUser(), fetchSettings()]);
            await navigateTo("/app");
        },
        onResponseError: (ctx) => {
            error.value = getErrorMsg(ctx.response._data);
            toast.error("Failed to login: " + error.value);
        },
    });
}
</script>

<template>
  <section
    v-if="!isSupportedPlatform"
    class="flex flex-col grow items-center justify-center text-center w-full"
  >
    <h1 class="text-2xl font-bold uppercase text-shadow mb-2">
      Play on your mobile
    </h1>

    <a
      href="https://t.me/s0nicash_bot"
      rel="noopener noreferrer"
    >
      <img
        class="object-contain w-56 h-56"
        src="~/assets/img/qr.png"
        alt="@s0nicash_bot"
      />
    </a>
    <a
      href="https://t.me/s0nicash_bot"
      rel="noopener noreferrer"
      class="text-2xl font-bold uppercase text-shadow mt-2"
    >
      @s0nicash_bot
    </a>
  </section>

  <div
    v-else
    class="splash-screen flex flex-col grow items-center justify-center text-center w-full"
  >
    <p
      v-if="error"
      class="text-lg font-bold uppercase text-shadow text-red-600 bg-black"
    >
      {{ error }}
    </p>

    <h1
      v-else-if="!initData"
      class="text-2xl font-bold uppercase text-shadow text-yellow-300"
    >
      No login information!
    </h1>

    <div
      v-else
      class="flex flex-col w-full grow justify-between"
    >
      <div class="w-full h-full" />
      <div class="flex flex-col items-center text-center w-full pb-6">
        <h1 class="text-6xl font-bold uppercase text-shadow">
          Sonicash
        </h1>

        <Icon
          name="bx:loader-alt"
          class="animate-spin h-10 w-10 mt-5"
        />

        <p class="mt-3 text-sm font-bold uppercase text-primary">
          Stay tuned
        </p>

        <p class="mt-1 font-medium">
          More info in official channels
        </p>

        <div class="flex items-center gap-4 mt-6">
          <a
            href="https://t.me/Sonicashh"
            target="_blank"
            rel="noreferrer"
            class="flex items-center justify-center w-12 h-12 border-2 rounded-full text-primary border-primary/10 bg-white/5"
          >
            <Icon
              name="ri:telegram-2-fill"
              class="w-6 h-6"
            />
          </a>
          <a
            href="https://www.youtube.com/@sonicash_bot"
            target="_blank"
            rel="noreferrer"
            class="flex items-center justify-center w-12 h-12 border-2 rounded-full text-primary border-primary/10 bg-white/5"
          >
            <Icon
              name="ri:youtube-fill"
              class="w-6 h-6"
            />
          </a>
          <a
            href="https://x.com/Sonicash_io"
            target="_blank"
            rel="noreferrer"
            class="flex items-center justify-center w-12 h-12 border-2 rounded-full text-primary border-primary/10 bg-white/5"
          >
            <Icon
              name="ri:twitter-x-line"
              class="w-6 h-6"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.splash-screen {
  background-image: url(~/assets/img/splash-screen/bg.png);
  background-size: cover;
  background-position: center;
}
</style>
