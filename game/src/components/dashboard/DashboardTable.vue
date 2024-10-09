<script lang="ts" setup>
defineProps<{
    columns: string[];
    selectable?: boolean;
}>();

const checked = ref<boolean>(false);

const emit = defineEmits<{
    allSelected: [checked: boolean];
}>();

function selectAll(): void {
    emit("allSelected", checked.value);
}
</script>

<template>
  <div class="overflow-auto grow basis-0 min-h-80">
    <!-- Table -->
    <table class="table table-zebra table-pin-rows mt-2 rounded-box">
      <thead>
        <tr>
          <th v-if="selectable">
            <input
              v-model="checked"
              aria-label="Check all"
              type="checkbox"
              class="checkbox checkbox-xs"
              @change="selectAll"
            />
          </th>
          <th
            v-for="col in columns"
            :key="col"
          >
            <span class="text-sm font-medium text-base-content/80">{{ col }}</span>
          </th>
        </tr>
      </thead>

      <tbody>
        <slot />
      </tbody>

      <tfoot>
        <tr>
          <th v-if="selectable">
            <input
              v-model="checked"
              aria-label="Check all"
              type="checkbox"
              class="checkbox checkbox-xs"
              @click="selectAll"
            />
          </th>
          <th
            v-for="col in columns"
            :key="col"
          >
            <span class="text-sm font-medium text-base-content/80">{{ col }}</span>
          </th>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<style>

</style>
