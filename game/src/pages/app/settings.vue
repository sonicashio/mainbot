<script lang="ts" setup>
definePageMeta({
    layout: "app-logged-in",
});

const { user, logout } = useUser();
</script>

<template>
  <section
    v-if="user !== null"
    class="flex flex-col my-auto mx-2"
  >
    <span class="text-4xl font-extrabold text-center mt-8 pb-1 select-none">Settings</span>

    <div class="w-full bg-[#12069B] shadow-md border-2 border-black/60 rounded-2xl mt-4 p-2 select-none">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Icon
            name="mdi:account-circle"
            class="w-12 h-12"
          />
          <div class="flex flex-col">
            <span class="text-lg font-bold">Username</span>
            <span class="text-sm font-light">
              {{ user.username ?? user.firstName + (user.lastName ? " " + user.lastName : "") }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full bg-[#12069B] shadow-md border-2 border-black/60 rounded-2xl mt-4 p-2 select-none">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Icon
            name="mdi:account-group"
            class="w-12 h-12"
          />
          <div class="flex flex-col">
            <span class="text-lg font-bold">Join Date</span>
            <span class="text-sm font-light">
              {{ new Date(user.createdAt).toLocaleDateString() }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full bg-[#12069B] shadow-md border-2 border-black/60 rounded-2xl mt-4 p-2 select-none">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Icon
            name="ph:globe-light"
            class="w-12 h-12"
          />
          <div class="flex flex-col">
            <span class="text-lg font-bold">Selected Language</span>
            <span class="text-sm font-light">English</span>
          </div>
        </div>
        <Icon
          name="mdi:chevron-right"
          class="w-12 h-12"
        />
      </div>
    </div>

    <button
      class="w-full bg-[#12069B] shadow-md border-2 border-black/60 rounded-2xl mt-4 p-2 select-none"
      @click="logout"
    >
      <div class="flex items-center">
        <div class="flex items-center gap-2">
          <Icon
            name="mdi:logout"
            class="w-12 h-12"
          />
          <span class="text-lg font-bold">Logout</span>
        </div>
      </div>
    </button>

    <!-- Options -->
    <!-- <div class="flex flex-col mt-4 select-none">
      <div class="flex justify-between">
        <span class="text-md font-bold text-white">Haptic Feedback</span>
        <label class="flex items-center cursor-pointer">
          <input
            type="checkbox"
            value=""
            class="sr-only peer"
          />
          <div class="switch" />
        </label>
      </div>
    </div> -->

    <!-- Divider -->
    <div class="w-full h-0.5 bg-gray-400 rounded-full my-4" />

    <!-- Links -->
    <div class="flex flex-col items-center justify-center">
      <div class="flex items-center gap-2">
        <NuxtLink to="/app/privacy">
          <span class="text-md text-white">Privacy Policy and Disclaimer</span>
        </NuxtLink>
      </div>
    </div>

    <div class="h-20" />
  </section>

  <div v-else>
    User not logged in
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .switch {
    @apply relative w-9 h-5 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full
          bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white
          after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border
          after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600;
  }
}
</style>
