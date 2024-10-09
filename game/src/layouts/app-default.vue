<script lang="ts" setup>
</script>

<template>
  <main class="flex flex-col w-full max-w-lg min-h-screen mx-auto text-white">
    <ClientOnly>
      <slot />
    </ClientOnly>
  </main>
</template>

<style>

</style>
