<script lang="ts" setup>
</script>

<template>
  <div
    class="flex flex-col w-full max-w-lg min-h-screen mx-auto text-white justify-between
    bg-gradient-to-t from-[#0029FF] to-95%"
  >
    <ClientOnly>
      <AppHeader />
      <slot />
      <AppFooter />
    </ClientOnly>
  </div>
</template>

<style>

</style>
