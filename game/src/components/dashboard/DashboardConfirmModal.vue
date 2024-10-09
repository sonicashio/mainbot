<script lang="ts" setup>
const isOpenModel = defineModel<boolean>();
defineProps<{
    title: string;
    subTitle: string;
    subTitleClass: string;
    buttonText: string;
    buttonClass: string;
}>();

const emit = defineEmits<{
    close: [];
    confirm: [];
}>();

function closeModal(): void {
    isOpenModel.value = false;
    emit("close");
}

function confirmModal(): void {
    emit("confirm");
}
</script>

<template>
  <DashboardModal
    v-model="isOpenModel"
    @close="closeModal"
  >
    <!-- Modal Title -->
    <h3 class="font-bold text-lg">
      {{ title }}
    </h3>

    <hr class="mt-2 border-base-content/10" />

    <!-- Modal Subtitle -->
    <p :class="'py-6 ' + subTitleClass">
      {{ subTitle }}
    </p>

    <hr class="-mb-4 border-base-content/10" />

    <!-- Modal Buttons -->
    <div class="modal-action">
      <!-- Close Button -->
      <button
        class="btn"
        @click="closeModal"
      >
        Close
      </button>

      <!-- Confirm Button -->
      <button
        :class="'btn ' + buttonClass"
        @click="confirmModal"
      >
        Confirm
      </button>
    </div>
  </DashboardModal>
</template>

<style>

</style>
