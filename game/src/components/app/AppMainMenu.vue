<script lang="ts" setup>
import { toast } from "vue3-toastify";

const isLoading = ref<boolean>(false);

// User
const { user, sync } = useUser();

// Daily login
const isDailyLoginPopupOpen = ref<boolean>(false);
const { data: daily, error } = await useFetch("/api/dailies");

if (error.value) {
    toast.error("Failed to fetch dailies: " + getErrorMsg(error));
}

async function claimDailyLogin(): Promise<void> {
    if (user.value === null) {
        return;
    }

    isLoading.value = true;
    try {
        await $fetch("/api/user/claim-daily-login", {
            method: "POST",
        });

        await sync(0);
        toast.success("Daily login claimed", { autoClose: 1000 });
    } catch (error) {
        toast.error("Failed to claim daily login: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

// Daily Reward
const isDailyRewardPopupOpen = ref<boolean>(false);

async function claimDailyReward(): Promise<void> {
    if (user.value === null) {
        return;
    }

    isLoading.value = true;
    try {
        await $fetch("/api/user/claim-daily-reward", {
            method: "POST",
        });

        await sync(0);
        toast.success("Daily reward claimed", { autoClose: 1000 });
    } catch (error) {
        toast.error("Failed to claim daily reward: " + getErrorMsg(error));
    }

    isLoading.value = false;
}
</script>

<template>
  <div>
    <!-- Daily Login -->
    <AppPopup
      v-model="isDailyLoginPopupOpen"
      title="Daily Login"
    >
      <div class="flex flex-col items-center justify-center text-white font-bold">
        <img
          class="object-contain w-28 h-28 pointer-events-none"
          src="~/assets/img/icons/daily-login.png"
          style="filter: drop-shadow(0 0 10px rgba(0, 100, 255, 1));"
        />

        <span class="mt-1 text-center text-white text-lg font-bold select-none">
          Don't miss Collecting your daily login reward
        </span>

        <div class="grid grid-cols-4 gap-1 mt-4 w-full place-items-stretch m-1 select-none">
          <button
            v-for="dailyLogin in daily?.dailies"
            :key="dailyLogin.day"
            class="flex flex-col items-center justify-center rounded-2xl border-b-2 border-black/50"
            :class="[
              dailyLogin.day <= user!.lastLoginRewardDay
                ? 'bg-blue-900'
                : (dailyLogin.day === user!.lastLoginRewardDay + 1 && user!.canClaimLoginReward
                  ? 'bg-[#FAFF00]/50'
                  : (dailyLogin.day === user!.lastLoginRewardDay + 1 && !user!.canClaimLoginReward ? 'bg-blue-900' : 'bg-blue-600')),
            ]"
            :disabled="user!.lastLoginRewardDay + 1 !== dailyLogin.day || !user!.canClaimLoginReward"
            @click="claimDailyLogin"
          >
            <span
              v-if="!dailyLogin.spcialDay"
              class="font-bold"
            >
              Day {{ dailyLogin.day }}
            </span>

            <span
              v-else
              class="font-bold text-[#F8EE12]"
              style="filter: drop-shadow(0 0 3px rgba(250, 255, 0, 1));"
            >
              Big Day
            </span>

            <img
              class="object-contain w-6 h-6 pointer-events-none mt-1"
              src="~/assets/img/icons/coin.png"
              style="filter: drop-shadow(0 0 10px rgba(250, 255, 0, 0.7));"
            />

            <span class="font-extrabold my-1">
              {{ dailyLogin.reward.toLocaleString("en-US") }}
            </span>
          </button>
        </div>
      </div>
    </AppPopup>

    <!-- Daily Reward -->
    <AppPopup
      v-model="isDailyRewardPopupOpen"
      title="Daily Reward"
    >
      <div class="flex flex-col items-center justify-center text-white font-bold">
        <img
          class="object-contain w-28 h-28 pointer-events-none"
          src="~/assets/img/icons/daily-reward2.png"
          style="filter: drop-shadow(0 0 10px rgba(0, 100, 255, 1));"
        />

        <span class="mt-1 text-center text-white text-lg font-bold select-none">
          Don't miss Collecting your daily reward
        </span>

        <div class="flex flex-col items-center justify-center gap-4 mt-1 w-full m-1 select-none">
          <img
            class="object-contain w-20 h-20 pointer-events-none mt-1"
            src="~/assets/img/icons/coin.png"
            style="filter: drop-shadow(0 0 20px rgba(250, 255, 0, 0.7));"
          />

          <span class="text-3xl font-extrabold text-yellow-300 mb-1">
            {{ daily?.dailyReward.toLocaleString("en-US") }}
          </span>

          <button
            class="flex items-center justify-center w-full text-white rounded-full text-center
            bg-[#002AFF] hover:bg-blue-700 ring-1 ring-blue-500 disabled:bg-blue-900/50 disabled:hover:bg-blue-900/50"
            :disabled="!user!.canClaimDailyReward"
            @click="claimDailyReward"
          >
            <span class="flex items-center justify-center gap-2 my-2 font-extrabold text-xl h-10">
              <template v-if="isLoading">
                <Icon
                  name="bx:loader-alt"
                  class="animate-spin h-8 w-8 mt-1"
                />
                Processing...
              </template>
              <template v-else-if="user!.canClaimDailyReward">
                Claim Reward
              </template>

              <template v-else>
                Claimed
              </template>
            </span>
          </button>
        </div>
      </div>
    </AppPopup>

    <!-- Menu -->
    <div class="grid grid-cols-12 gap-2">
      <button
        class="col-span-4 p-1 select-none bg-gradient-to-r from-[#243db4] via-[#3f75e0] to-[#1621c6] rounded-lg"
        @click="isDailyLoginPopupOpen = true"
      >
        <div class="flex flex-col items-center justify-center text-white font-bold">
          <img
            class="object-contain h-10 pointer-events-none"
            src="~/assets/img/icons/daily-login.png"
          />
          <p class="mt-0.5 text-center text-white text-sm font-bold">
            Daily Login
          </p>
        </div>
      </button>

      <button
        class="col-span-4 p-1 select-none bg-gradient-to-r from-[#243db4] via-[#3f75e0] to-[#1621c6] rounded-lg"
        @click="isDailyRewardPopupOpen = true"
      >
        <div class="flex flex-col items-center justify-center text-white font-bold">
          <img
            class="object-contain h-10 pointer-events-none"
            src="~/assets/img/icons/daily-reward.png"
          />
          <p class="mt-0.5 text-center text-white text-sm font-bold">
            Daily Reward
          </p>
        </div>
      </button>

      <NuxtLink
        to="/app/lucky-wheel"
        class="relative col-span-4 p-1 select-none bg-gradient-to-r from-[#243db4] via-[#3f75e0] to-[#1621c6] rounded-lg"
      >
        <div class="flex flex-col items-center justify-center text-white font-bold">
          <img
            class="object-contain h-10 pointer-events-none"
            src="~/assets/img/icons/lucky-wheel.png"
          />
          <p class="mt-0.5 text-center text-white text-sm font-bold">
            Lucky wheel
          </p>
        </div>

        <div class="flex items-center justify-center absolute top-0 left-0 right-0 bottom-0 bg-black opacity-70">
          <span class="text-2xl font-extrabold text-yellow-300">Soon</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
</style>
