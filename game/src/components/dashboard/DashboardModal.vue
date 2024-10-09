<script lang="ts" setup>
const isOpenModel = defineModel<boolean>();
const emit = defineEmits<{
    close: [];
}>();

function closeModal(): void {
    isOpenModel.value = false;
    emit("close");
}
</script>

<template>
  <div
    v-show="isOpenModel"
    class="fixed inset-0 z-50 bg-black bg-opacity-50"
  />

  <dialog
    class="modal"
    :open="isOpenModel"
    @close="closeModal"
  >
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
          ✕
        </button>
      </form>
      <slot />
    </div>
  </dialog>
</template>

<style scoped>
</style>
