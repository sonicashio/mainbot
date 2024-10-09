<script lang="ts" setup>
import { toast } from "vue3-toastify";

definePageMeta({
    layout: "dashboard",
});

const isLoading = ref<boolean>(false);

const { data: usersStatics, error } = await useFetch("/api/dashboard/statics/users");
if (error.value) {
    toast.error("Failed to fetch users statics: " + getErrorMsg(error.value));
}

async function fetchStats(): Promise<void> {
    isLoading.value = true;

    try {
        usersStatics.value = await $fetch("/api/dashboard/statics/users");
    } catch (error) {
        toast.error("Failed to fetch users statics: " + getErrorMsg(error));
    }
    isLoading.value = false;
}

// function formatTime(ms: number): string {
//     const seconds = Math.floor(ms / 1000);
//     const minutes = Math.floor(seconds / 60);
//     const hours = Math.floor(minutes / 60);
//     return `${hours}h ${minutes % 60}m`;
// }

const userGrowthChartData = computed(() => ({
    options: {
        title: { text: "User Growth" },
        theme: {
            mode: "dark",
        },
        chart: {
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        yaxis: {
            labels: {
                formatter: (value: number): string => value.toFixed(0),
            },
        },
        tooltip: {
            y: {
                formatter: (value: number): string => value.toFixed(0),
            },
        },
        xaxis: { categories: usersStatics.value!.userGrowth7Day.map(item => item.date) },
    },
    series: [{ name: "New Users", data: usersStatics.value!.userGrowth7Day.map(item => item.count) }],
}));

const topUsersChartData = computed(() => ({
    options: {
        title: { text: "Top Users by Coins" },
        theme: {
            mode: "dark",
        },
        chart: {
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        yaxis: {
            labels: {
                formatter: (value: number): string => value.toFixed(0),
            },
        },
        tooltip: {
            y: {
                formatter: (value: number): string => value.toFixed(0),
            },
        },
        xaxis: { categories: usersStatics.value!.topUsers.map(user => user.telegramId) },
    },
    series: [{ name: "Coins", data: usersStatics.value!.topUsers.map(user => user.balance) }],
}));

const usersByCountryChartData = computed(() => ({
    options: {
        title: { text: "Users by Country" },
        theme: {
            mode: "dark",
        },
        chart: {
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        xaxis: { categories: usersStatics.value!.usersByCountry.map(item => item.country) },
        plotOptions: {
            bar: {
                borderRadius: 4,
                borderRadiusApplication: "end",
                horizontal: true,
            },
        },
        dataLabels: {
            enabled: false,
        },
    },
    series: [{ data: usersStatics.value!.usersByCountry.map(item => item.count) }],
}));

const avgCoinsChartData = computed(() => ({
    options: {
        title: { text: "Average Coins Earned" },
        theme: {
            mode: "dark",
        },
        chart: {
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        yaxis: {
            labels: {
                formatter: (value: number): string => value.toFixed(0),
            },
        },
        tooltip: {
            y: {
                formatter: (value: number): string => value.toFixed(0),
            },
        },
        xaxis: { categories: ["Average"] },
    },
    series: [{ name: "Average Coins", data: [usersStatics.value!.avgCoinsPerUser] }],
}));
</script>

<template>
  <div
    v-if="usersStatics !== null"
    class="flex flex-col grow drawer-content"
  >
    <div class="px-6 space-y-6 grow">
      <!-- Header with Time Range Selector -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">
          User Statistics Dashboard
        </h1>

        <div class="flex items-center gap-4">
          <button
            class="btn btn-primary btn-sm"
            :class="{ loading: isLoading }"
            @click="fetchStats"
          >
            Refresh
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <DashboardCard
          title="Total Users"
          :value="usersStatics.totalUsers"
          icon="👥"
        />
        <DashboardCard
          title="Total Clicks"
          :value="usersStatics.totalClicks"
          icon="🖱️"
        />
        <DashboardCard
          title="Total Mined Coins"
          :value="usersStatics.totalClicksCoins"
          icon="⛏️"
        />
        <DashboardCard
          title="Total Holded Coins"
          :value="usersStatics.totalCoins"
          icon="💰"
        />
        <DashboardCard
          title="Avg Clicks/User"
          :value="usersStatics.avgClicksPerUser.toFixed(2)"
          icon="📊"
        />
        <DashboardCard
          title="Avg Coins/User"
          :value="usersStatics.avgCoinsPerUser.toFixed(2)"
          icon="🪙"
        />
        <DashboardCard
          title="Most Active User"
          :value="usersStatics.mostActiveUser?.username || 'N/A'"
          :subvalue="`${usersStatics.mostActiveUser?.totalClicks || 0} clicks`"
          icon="🏆"
        />
        <DashboardCard
          title="New Users (24h)"
          :value="usersStatics.newUsers24h"
          icon="🆕"
        />
        <DashboardCard
          title="Total Referral Rewards"
          :value="usersStatics.totalReferralRewards"
          icon="🎁"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <DashboardChart
          type="line"
          :data="userGrowthChartData"
        />
        <DashboardChart
          type="bar"
          :data="topUsersChartData"
        />

        <DashboardChart
          type="bar"
          :data="usersByCountryChartData"
        />
        <DashboardChart
          type="line"
          :data="avgCoinsChartData"
        />
      </div>
    </div>
  </div>

  <div v-else>
    Failed to load users statics. Please try again later.
  </div>
</template>

<style></style>
