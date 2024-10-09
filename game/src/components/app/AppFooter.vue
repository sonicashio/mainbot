<script lang="ts" setup>
const icons: Record<string, string> = useIconsAssets();

const route = useRoute();

const navItems = [
    { name: "Heros", url: "/app/heros", icon: "heros" },
    { name: "Earn", url: "/app/earn", icon: "earn" },
    { name: "", url: "/app/", icon: "coin", main: true },
    { name: "Friends", url: "/app/friends", icon: "friends" },
    { name: "Airdrop", url: "/app/airdrop", icon: "airdrop" },
];
</script>

<template>
  <footer class="max-w-lg w-full fixed bottom-0 select-none text-white py-2 px-0.5">
    <div
      class="flex justify-between w-full h-20 rounded-full px-5 py-1
    bg-blue-950 bg-opacity-80 border-gray-600 backdrop-blur-sm shadow-sm shadow-blue-700"
    >
      <NuxtLink
        v-for="item in navItems"
        :key="item.name"
        class="flex flex-col items-center justify-center"
        :class="[
          item.url === route.path && !item.main ? 'border-b-2 border-yellow-400' : '',
        ]"
        :to="item.url"
      >
        <img
          :src="icons[item.icon]"
          :alt="item.name"
          :class="[
            item.main ? '-top-8 w-20 h-20' : '',
          ]"
          class="object-contain w-12 h-12 pointer-events-none"
        />
        <span
          class="text-sm font-semibold"
          :class="[item.main ? 'text-yellow-400 font-bold absolute bottom-1.5' : 'text-gray-400']"
        >
          {{ item.name }}
        </span>
      </NuxtLink>
    </div>
  </footer>
</template>

<style>

</style>
