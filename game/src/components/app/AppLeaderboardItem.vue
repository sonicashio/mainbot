<script lang="ts" setup>
import type { LeaderboardUser } from "~/types";

defineProps<{
    user: LeaderboardUser;
    sticky?: boolean;
}>();
</script>

<template>
  <li
    class="flex items-stretch py-2 px-2"
    :class="[
      user.isMe ? 'text-black bg-[#F1C21B]' : '',
      sticky ? 'bg-[#F1C21B] sticky bottom-0' : '',
    ]"
  >
    <!-- Rank -->
    <img
      v-if="user.rank === 1"
      src="~/assets/img/icons/gold-medal.png"
      class="object-contain h-12 w-12 pointer-events-none"
    />

    <img
      v-else-if="user.rank === 2"
      src="~/assets/img/icons/silver-medal.png"
      class="object-contain h-12 w-12 pointer-events-none"
    />

    <img
      v-else-if="user.rank === 3"
      src="~/assets/img/icons/bronze-medal.png"
      class="object-contain h-12 w-12 pointer-events-none"
    />

    <span
      v-else
      class="flex items-center justify-center min-w-12 font-bold"
    >
      {{ user.rank }}
    </span>

    <div class="px-1.5">
      <img
        v-if="user.photoUrl"
        class="object-contain h-12 w-12 rounded-full bg-gray-50 pointer-events-none"
        :src="user.photoUrl"
      />

      <span
        v-else
        class="flex items-center justify-center h-12 w-12 rounded-full text-black bg-gray-50"
      >
        {{ user.firstCharsName }}
      </span>
    </div>

    <div class="flex flex-col">
      <p class="text-sm font-bold leading-6">
        {{ user.username }}
      </p>
      <div class="flex items-center justify-center gap-1">
        <img
          class="object-contain h-5 w-5"
          src="~/assets/img/icons/coin.png"
          alt="coin"
        />
        <p class="truncate text-sm leading-5 text-gray-500">
          <span
            class="font-bold"
            :class="[user.isMe || sticky ? 'text-white' : 'text-yellow-400']"
          >
            {{ user.profitPerHour.toLocaleString("en-US") }}
          </span>
          Profit / Hour
        </p>
      </div>
    </div>
  </li>
</template>

<style>
</style>
