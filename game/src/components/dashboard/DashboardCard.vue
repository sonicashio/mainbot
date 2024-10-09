<script lang="ts" setup>
defineProps<{
    title: string;
    value: string | number;
    icon: string;
    subvalue?: string;
}>();
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">
        {{ title }}
      </h2>
      <div class="flex items-center justify-between">
        <div class="text-3xl font-bold">
          {{ value }}
        </div>
        <div class="text-4xl select-none">
          {{ icon }}
        </div>
      </div>
      <p
        v-if="subvalue"
        class="text-sm text-gray-500"
      >
        {{ subvalue }}
      </p>
    </div>
  </div>
</template>

<style>

</style>
