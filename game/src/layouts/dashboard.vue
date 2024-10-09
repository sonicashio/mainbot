<script lang="ts" setup>
import type { MenuItem } from "~/types";

const menuItems: MenuItem[] = [
    {
        route: "/dashboard",
        icon: "mdi:view-dashboard",
        localeName: "appName",
    },
    {
        route: "/dashboard/users",
        icon: "mdi:account-supervisor",
        localeName: "users",
    },
    {
        route: "/dashboard/user-levels",
        icon: "mdi:account-reactivate-outline",
        localeName: "userLevels",
    },
    {
        route: "/dashboard/characters",
        icon: "ic:baseline-cruelty-free",
        localeName: "characters",
    },
    {
        route: "/dashboard/character-levels",
        icon: "ic:outline-developer-board",
        localeName: "characterLevels",
    },
    {
        route: "/dashboard/earn-tasks",
        icon: "ic:round-task",
        localeName: "earnTasks",
    },
    {
        route: "/dashboard/daily-logins",
        icon: "material-symbols-light:rewarded-ads",
        localeName: "dailyLogins",
    },
    {
        route: "/dashboard/settings",
        icon: "ic:twotone-settings",
        localeName: "settings",
    },
];
const avatarItems: MenuItem[] = [
];
</script>

<template>
  <div class="drawer lg:drawer-open h-screen">
    <input
      id="app-drawer"
      type="checkbox"
      class="drawer-toggle"
    />

    <div class="flex flex-col drawer-content overflow-y-auto">
      <DashboardNavbar :avatar-items="avatarItems" />

      <main class="flex flex-col grow overflow-auto py-4 px-6 bg-base-300">
        <slot />
      </main>
    </div>

    <aside class="drawer-side z-30 border-r-2 border-r-base-300">
      <label
        for="app-drawer"
        aria-label="close sidebar"
        class="drawer-overlay"
      />

      <DashboardSidebar :side-items="menuItems" />
    </aside>
  </div>
</template>

<style>

</style>
