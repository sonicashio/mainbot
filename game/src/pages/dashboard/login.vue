<script lang="ts" setup>
import { LoginWidget } from "vue-tg";
import type { LoginWidgetUser } from "vue-tg";
import { toast } from "vue3-toastify";

const error = ref<string | undefined>(undefined);

if (import.meta.dev) {
    const user: LoginWidgetUser = {
        id: 589406119,
        first_name: "Islam",
        username: "CorrM",
        photo_url: "https://t.me/i/userpic/320/bhjRSTWEJZtF2KJn2hhtAfjLJpIWs793LDWW0XhBX18.jpg",
        auth_date: 1727897130,
        hash: "781cea73f2e54269f76a671c925906568c5ee5cc0de311cdf2a3d08d8d150f72",
    };
    await handleUserAuth(user);
}

async function handleUserAuth(user: LoginWidgetUser): Promise<void> {
    const params = new URLSearchParams();
    for (const key in user) {
        params.set(key, (user as { [key: string]: string })[key]);
    }

    try {
        await $fetch("/api/dashboard/auth/login", {
            method: "POST",
            body: {
                tgInitData: params.toString(),
            },
        });

        await useUser().fetch();
        await navigateTo("/dashboard");
    } catch (error) {
        toast.error("Failed to login: " + getErrorMsg(error));
    }
}
</script>

<template>
  <div class="flex flex-col min-h-screen text-white">
    <div class="flex flex-col items-center m-auto text-center max-w-md">
      <span class="text-xl font-extrabold text-center">Login With Telegram</span>
      <p class="text-md font-light text-center mb-4">
        If you're not a moderator and attempt to log in, you'll be <span class="text-red-500 font-bold">banned immediately</span>
      </p>

      <LoginWidget
        bot-username="s0nicash_bot"
        :user-photo="true"
        @auth="handleUserAuth"
      />

      {{ error }}
    </div>
  </div>
</template>
