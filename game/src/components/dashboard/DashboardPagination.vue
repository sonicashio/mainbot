<script lang="ts" setup>
interface Props {
    totalPages: number;
    visibleButtons?: number;
    disabled?: boolean; // New prop for disable state
}

const props = withDefaults(defineProps<Props>(), {
    currentPage: 1,
    visibleButtons: 6,
    disabled: false,
});

const currentPage = defineModel<number>({ required: true, default: 1 });

const emit = defineEmits<{
    pageChanged: [page: number];
}>();

// Pagination logic
const visiblePages = computed(() => {
    const pages: number[] = [];

    // We need to show exactly visibleButtons number of elements
    // First and last pages are always shown (2 slots)
    // Each ellipsis takes 1 slot
    const maxMiddleButtons = Math.max(6, props.visibleButtons) - 2; // Subtract first and last page buttons

    if (props.totalPages <= Math.max(6, props.visibleButtons)) {
        // Show all pages if total is less than or equal to visibleButtons
        for (let i = 1; i <= props.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    // Always add first page
    pages.push(1);

    // Calculate the middle range
    let start = currentPage.value;
    let end = currentPage.value;
    let middleButtonsToShow = maxMiddleButtons;

    // Check if we need ellipsis at the start
    const needsStartEllipsis = currentPage.value > 3;
    if (needsStartEllipsis) {
        pages.push(-1); // Add start ellipsis
        middleButtonsToShow--; // Reduce middle buttons by 1
    } else {
        // If no start ellipsis, we show more numbers at the start
        start = 2;
    }

    // Check if we need ellipsis at the end
    const needsEndEllipsis = currentPage.value < props.totalPages - 2;
    if (needsEndEllipsis) {
        middleButtonsToShow--; // Reduce middle buttons by 1 for end ellipsis
    }

    // Calculate middle buttons
    const halfMiddle = Math.floor(middleButtonsToShow / 2);
    if (needsStartEllipsis) {
        start = currentPage.value - halfMiddle;
    }
    end = start + middleButtonsToShow - 1;

    // Adjust bounds
    if (end >= props.totalPages - 1) {
        end = props.totalPages - 1;
        start = end - middleButtonsToShow + 1;
    }
    if (start <= 2) {
        start = 2;
        end = start + middleButtonsToShow - 1;
    }

    // Add middle numbers
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    // Add end ellipsis if needed
    if (needsEndEllipsis && end < props.totalPages - 1) {
        pages.push(-1);
    }

    // Always add last page
    pages.push(props.totalPages);

    return pages;
});

function changePage(page: number): void {
    if (!props.disabled && page >= 1 && page <= props.totalPages) {
        currentPage.value = page;
        emit("pageChanged", page);
    }
}
</script>

<template>
  <div
    class="join"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
  >
    <!-- Previous button -->
    <button
      class="join-item btn btn-square"
      :disabled="disabled || currentPage === 1"
      @click="changePage(currentPage - 1)"
    >
      «
    </button>

    <!-- Page buttons -->
    <template
      v-for="page in visiblePages"
      :key="page"
    >
      <template v-if="page === -1">
        <span
          class="join-item btn btn-square"
          disabled
        >
          ...
        </span>
      </template>
      <template v-else>
        <input
          class="join-item btn btn-square"
          type="radio"
          name="options"
          :aria-label="page.toString()"
          :checked="currentPage === page"
          :disabled="disabled"
          @click="changePage(page)"
        />
      </template>
    </template>

    <!-- Next button -->
    <button
      class="join-item btn btn-square"
      :disabled="disabled || currentPage === props.totalPages"
      @click="changePage(currentPage + 1)"
    >
      »
    </button>
  </div>
</template>

<style scoped>
</style>
