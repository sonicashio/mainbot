<script lang="ts" setup>
const isOpenModel = defineModel<boolean>();

const props = defineProps<{ title: string }>();
const emit = defineEmits<{ close: [] }>();
const { isPopupOpen } = useAppPopup();

const { useWebAppBackButton } = await import("vue-tg");
const { isBackButtonVisible, showBackButton, hideBackButton } = useWebAppBackButton();

function closeModal(): void {
    if (!isBackButtonAlreadyVisible.value) {
        hideBackButton();
    }

    isPopupOpen.value = false;
    isOpenModel.value = false;

    emit("close");
}

// Close popup
const modalContent = ref<HTMLDivElement | null>(null);
const isBackButtonAlreadyVisible = ref<boolean>(false);

onClickOutside(modalContent, closeModal);

watch(isOpenModel, (value) => {
    isPopupOpen.value = value ?? false;
    if (!isOpenModel.value) {
        return;
    }

    if (!isBackButtonVisible.value) {
        showBackButton();
    }

    isBackButtonAlreadyVisible.value = isBackButtonVisible.value;
});

watch(isPopupOpen, (value) => {
    if (value) {
        return;
    }

    closeModal();
});
</script>

<template>
  <div>
    <Transition name="slide-up">
      <div
        v-if="isOpenModel"
        class="fixed inset-x-0 bottom-0 flex justify-center items-end z-50"
      >
        <div
          ref="modalContent"
          class="flex flex-col ring-4 ring-white pt-6 px-2 max-h-[80vh] w-full max-w-lg
          bg-gradient-to-t from-[#221E53] to-95% to-[#08287A] "
          :class="{ 'translate-y-full': !isOpenModel }"
          style="border-top-left-radius: 72px; border-top-right-radius: 72px; filter: drop-shadow(0 -50px 50px rgba(255, 255, 0, 0.9));"
        >
          <div class="flex items-center ml-4">
            <h2 class="text-2xl font-bold select-none text-center grow">
              {{ props.title }}
            </h2>

            <button
              class="h-10 mr-2"
              @click="closeModal"
            >
              <Icon
                class="h-10 w-10"
                name="material-symbols:close-rounded"
              />
            </button>
          </div>

          <div class="overflow-y-auto px-2 pt-3 pb-2">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
