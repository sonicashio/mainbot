<script lang="ts" setup>
const { user } = useUser();

const username = computed<string>(() => {
    if (!user.value) {
        return "Not logged in";
    }

    return user.value.username ?? user.value.firstName + (user.value.lastName ? " " + user.value.lastName : "");
});
const firstCharOfName = computed<string>(() => {
    if (!user.value) {
        return "Not logged in";
    }

    if (user.value.username) {
        return user.value.username[0];
    }

    if (user.value.firstName && user.value.lastName) {
        return user.value.firstName[0] + user.value.lastName[0];
    }

    return user.value.firstName[0];
});
const joinedAt = computed<string>(() => {
    if (!user.value) {
        return "Not logged in";
    }

    return new Date(user.value.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
    });
});
const levelProgress = computed<number>(() => {
    if (!user.value) {
        return 0;
    }

    if (user.value.nextLevel === null || user.value.balance > user.value.nextLevel.requiredBalance) {
        return 100;
    }

    return Math.min(100, Math.floor((user.value.balance / user.value.nextLevel.requiredBalance) * 100));
});
</script>

<template>
  <header
    v-if="user !== null"
    class="flex flex-col my-1 mb-2 select-none"
  >
    <!-- <h2 class="text-3xl font-bold uppercase text-shadow text-center">
      Sonicash
    </h2> -->

    <div class="grid grid-cols-12 select-none mx-2">
      <!-- User info -->
      <div class="col-span-9 flex items-center gap-2">
        <div class="relative">
          <div
            v-if="!user.photoUrl"
            class="min-w-14 max-w-14 min-h-14 max-h-14 relative inline-flex items-center justify-center
            overflow-hidden ring-2 rounded-full bg-gray-600"
          >
            <span class="text-2xl font-bold text-gray-300 uppercase overflow-hidden">{{ firstCharOfName }}</span>
          </div>

          <img
            v-else
            class="min-w-14 max-w-14 min-h-14 max-h-14 p-1 rounded-full ring-2 ring-gray-500 pointer-events-none"
            :src="user.photoUrl"
            alt="avatar"
          />

          <span class="flex items-center justify-center absolute top-9 left-9 border-2 w-6 h-6 bg-gray-500 border-gray-800 rounded-full">
            <span class="text-sm font-bold">{{ user?.level.level }}</span>
          </span>
        </div>

        <div class="flex flex-col font-medium text-white min-w-40 leading-5">
          <div>{{ username }}</div>
          <div class="text-sm text-gray-400">
            Joined in {{ joinedAt }}
          </div>
          <div class="w-full bg-gray-700 rounded-full h-1.5 mt-1">
            <div
              class="bg-yellow-500 h-1.5 rounded-full"
              :style="[{ width: `${levelProgress}%` }]"
            />
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="col-span-3 flex items-center justify-end gap-2">
        <NuxtLink
          to="/app/leaderboard"
          class="flex items-center"
        >
          <img
            class="object-contain w-8 h-8 pointer-events-none select-none"
            src="~/assets/img/icons/leaderboard.png"
            alt="leaderboard"
          />
        </NuxtLink>

        <NuxtLink
          to="/app/settings"
          class="flex items-center"
          style="padding-top: 1px;"
        >
          <Icon
            class="w-8 h-8"
            name="material-symbols:settings-outline"
          />
        </NuxtLink>
      </div>
    </div>
  </header>

  <div v-else>
    User not logged in
  </div>
</template>

<style>

</style>
