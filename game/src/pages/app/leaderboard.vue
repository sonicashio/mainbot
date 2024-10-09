<script lang="ts" setup>
import { toast } from "vue3-toastify";
import type { LeaderboardUser } from "~/types";

definePageMeta({
    layout: "app-logged-in",
});

const isLoading = ref<boolean>(true);
const { user } = useUser();
const leaderboard = ref<{ topUsers: LeaderboardUser[]; user: LeaderboardUser | undefined } | null>(null);
const currentLevel = ref<number>(user.value!.level.level);
const maxLevel = ref<number>(currentLevel.value);

async function fetchLeaderboard(level: number): Promise<void> {
    if (user.value === null) {
        return;
    }

    isLoading.value = true;
    try {
        const data = await $fetch(`/api/leaderboard?level=${level}`);

        leaderboard.value = {
            topUsers: data.topUsers.map((lUser) => {
                return {
                    rank: lUser.rank,
                    isMe: lUser.telegramId === user.value!.telegramId,
                    username: lUser.username ?? lUser.firstName + (lUser.lastName ? " " + lUser.lastName : ""),
                    profitPerHour: lUser.profitPerHour,
                    photoUrl: lUser.photoUrl,
                    firstCharsName: firstCharsNameOfUserData(lUser),
                } as LeaderboardUser;
            }),
            user: data.user === undefined
                ? undefined
                : {
                        rank: data.user.rank,
                        isMe: data.user.telegramId === user.value!.telegramId,
                        username: data.user.username ?? data.user.firstName + (data.user.lastName ? " " + data.user.lastName : ""),
                        profitPerHour: data.user.profitPerHour,
                        photoUrl: data.user.photoUrl,
                        firstCharsName: firstCharsNameOfUserData(data.user),
                    } as LeaderboardUser,
        };

        maxLevel.value = data.maxLevel;
    } catch (error) {
        toast.error("Failed to fetch leaderboard data: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

async function previousLevel(): Promise<void> {
    if (currentLevel.value <= 1) {
        return;
    }

    currentLevel.value--;
    await fetchLeaderboard(currentLevel.value);
}

async function nextLevel(): Promise<void> {
    currentLevel.value++;
    await fetchLeaderboard(currentLevel.value);
}

onMounted(async () => {
    await fetchLeaderboard(currentLevel.value);
});
</script>

<template>
  <section
    v-if="user !== null && leaderboard !== null"
    class="flex flex-col grow mx-2 select-none"
  >
    <div class="text-center my-2">
      <h1 class="text-3xl font-bold">
        Leaderboard
      </h1>

      <span class="text-sm font-light">
        Updated every 10 minutes
      </span>
    </div>

    <!-- Levels -->
    <div class="flex items-center justify-between">
      <button
        class="flex bg-blue-500 hover:bg-blue-700 disabled:bg-blue-900/50 text-white font-bold rounded"
        :disabled="currentLevel === 1 || isLoading"
        @click="previousLevel"
      >
        <Icon
          name="mdi:chevron-left"
          class="w-10 h-10"
        />
      </button>

      <span class="text-xl font-semibold">
        Level <span class="font-bold text-yellow-400">{{ currentLevel }}</span>
      </span>

      <button
        class="flex bg-blue-500 hover:bg-blue-700 disabled:bg-blue-900/50 text-white font-bold rounded"
        :disabled="currentLevel >= maxLevel || isLoading"
        @click="nextLevel"
      >
        <Icon
          name="mdi:chevron-right"
          class="w-10 h-10"
        />
      </button>
    </div>

    <!-- Top users -->
    <div
      class="flex flex-col mt-1 mb-3 bg-[#12069B] shadow-md border-2 border-black/60 rounded-2xl
        overflow-y-scroll grow basis-0 flex-shrink"
    >
      <!-- List -->
      <div
        v-if="!isLoading"
        class="flex py-1 select-none"
        :class="[
          leaderboard.topUsers.length == 0 ? 'text-center' : '',
        ]"
      >
        <ul
          v-if="leaderboard.topUsers.length > 0"
          role="list"
          class="divide-y divide-blue-600/70 grow"
        >
          <AppLeaderboardItem
            v-for="lUser in leaderboard.topUsers"
            :key="lUser.username"
            :user="lUser"
          />

          <AppLeaderboardItem
            v-if="leaderboard.user !== undefined"
            :user="leaderboard.user"
            :sticky="true"
          />
        </ul>

        <span
          v-else
          class="text-md mx-auto text-white font-bold select-none"
        >
          There are no users at this level
        </span>
      </div>

      <div
        v-else
        class="flex flex-col mx-2 my-auto text-center"
      >
        <span class="flex items-center justify-center gap-2 my-2 font-extrabold text-xl h-10">
          <Icon
            name="bx:loader-alt"
            class="animate-spin h-8 w-8 mt-1"
          />
          Processing...
        </span>
      </div>
    </div>

    <div class="h-20" />
  </section>

  <div
    v-else-if="isLoading"
    class="flex flex-col mx-2 my-auto text-center"
  >
    <span class="flex items-center justify-center gap-2 my-2 font-extrabold text-xl h-10">
      <Icon
        name="bx:loader-alt"
        class="animate-spin h-8 w-8 mt-1"
      />
      Processing...
    </span>
  </div>

  <div
    v-else
    class="flex flex-col mx-2 my-auto text-center"
  >
    User not logged in
  </div>
</template>

<style>

</style>
