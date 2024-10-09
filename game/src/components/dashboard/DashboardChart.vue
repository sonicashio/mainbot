<script lang="ts" setup>
defineProps<{
    type: string;
    data: { options: unknown; series: unknown };
}>();
</script>

<template>
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body p-4">
            <apexchart :type="type" :options="data.options" :series="data.series" />
        </div>
    </div>
</template>

<style>
svg.apexcharts-svg {
    background: transparent !important;
}
</style>
