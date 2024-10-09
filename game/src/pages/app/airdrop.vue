<script lang="ts" setup>
definePageMeta({
    layout: "app-logged-in",
});
</script>

<template>
  <section class="flex flex-col grow mx-2">
    <!-- Header -->
    <div class="flex flex-col mt-8 select-none">
      <img
        class="object-contain h-28 mx-auto pointer-events-none"
        src="~/assets/img/icons/coin.png"
        style="filter: drop-shadow(0 0 20px rgba(250, 255, 0, 0.7));"
      />

      <span class="text-3xl font-extrabold text-center text-yellow-300 mt-6 pb-1">
        AirDrop
      </span>
    </div>

    <span class="text-3xl font-extrabold text-center my-auto pb-1 select-none">Coming Soon</span>
    <div class="h-20" />
  </section>
</template>

<style>

</style>
