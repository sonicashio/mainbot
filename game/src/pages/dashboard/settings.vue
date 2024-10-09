<script lang="ts" setup>
import { toast } from "vue3-toastify";

definePageMeta({
    layout: "dashboard",
});

const isLoading = ref<boolean>(false);

const { data: settings, error } = useFetch("/api/settings");
if (error.value) {
    toast.error("Failed to fetch settings: " + getErrorMsg(error.value));
}

async function submitSettings(): Promise<void> {
    if (settings.value === null) {
        return;
    }

    isLoading.value = true;

    try {
        await $fetch("/api/dashboard/settings", {
            method: "POST",
            body: settings.value,
        });

        toast.success("Settings submitted", { autoClose: 1000 });
    } catch (error) {
        toast.error("Failed to submit settings: " + getErrorMsg(error));
    }

    isLoading.value = false;
}
</script>

<template>
  <div
    v-if="settings !== null"
    class="flex flex-col drawer-content"
  >
    <h3 class="text-lg font-bold">
      Settings
    </h3>

    <div class="card bg-base-100 shadow-md card-bordered mt-5">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
          <section>
            <!-- Main Settings -->
            <div>
              <h2 class="text-lg font-bold mb-4">
                Main Settings
              </h2>

              <!-- Telegram Web App Url -->
              <div class="form-control mb-4">
                <label
                  class="label"
                  for="telegram_web_app_url"
                >
                  <span class="label-text">Telegram Web App Url</span>
                </label>
                <input
                  id="telegram_web_app_url"
                  v-model="settings.telegramWebAppUrl"
                  type="url"
                  placeholder="Enter Telegram Web App Url"
                  class="input input-bordered w-full"
                />
              </div>

              <!-- Telegram Channel ID -->
              <div class="form-control mb-4">
                <label
                  class="label"
                  for="telegram_channel_id"
                >
                  <span class="label-text">Telegram Channel ID</span>
                </label>
                <input
                  id="telegram_channel_id"
                  v-model="settings.telegramChannelId"
                  type="text"
                  placeholder="Enter Telegram Channel ID"
                  class="input input-bordered w-full"
                />
              </div>
            </div>

            <!-- Energy Limit Settings -->
            <div>
              <h2 class="text-lg font-bold mb-4">
                Energy Limit Settings
              </h2>

              <!-- Starting Energy Limit -->
              <div class="form-control mb-4">
                <label
                  class="label"
                  for="starting_energy_limit"
                >
                  <span class="label-text">Starting Energy Limit</span>
                </label>
                <input
                  id="starting_energy_limit"
                  v-model="settings.startingEnergyLimit"
                  type="number"
                  placeholder="Enter Starting Energy Limit"
                  class="input input-bordered"
                />
              </div>

              <!-- Energy Limit Per Character -->
              <div class="form-control mb-4">
                <label
                  class="label"
                  for="energy_limit_per_character"
                >
                  <span class="label-text">Energy Limit Per Character</span>
                </label>
                <input
                  id="energy_limit_per_character"
                  v-model="settings.energyLimitPerCharacter"
                  type="number"
                  placeholder="Enter Energy Limit Per Character"
                  class="input input-bordered"
                />
              </div>

              <!-- Energy Limit Per Level -->
              <div class="form-control mb-4">
                <label
                  class="label"
                  for="energy_limit_per_level"
                >
                  <span class="label-text">Energy Limit Per Level</span>
                </label>
                <input
                  id="energy_limit_per_level"
                  v-model="settings.energyLimitPerLevel"
                  type="number"
                  placeholder="Enter Energy Limit Per Level"
                  class="input input-bordered"
                />
              </div>

              <!-- Energy Limit Per Booster -->
              <div class="form-control mb-6">
                <label
                  class="label"
                  for="energy_limit_per_booster"
                >
                  <span class="label-text">Energy Limit Per Booster</span>
                </label>
                <input
                  id="energy_limit_per_booster"
                  v-model="settings.energyLimitPerBooster"
                  type="number"
                  placeholder="Enter Energy Limit Per Booster"
                  class="input input-bordered"
                />
              </div>
            </div>
          </section>

          <section>
            <!-- User Settings -->
            <div>
              <h2 class="text-lg font-bold mb-4">
                User Settings
              </h2>

              <!-- Starting Balance -->
              <div class="form-control mb-4">
                <label
                  class="label"
                  for="starting_balance"
                >
                  <span class="label-text">Starting Balance</span>
                </label>
                <input
                  id="starting_balance"
                  v-model="settings.userStartingBalance"
                  type="number"
                  placeholder="Enter Starting Balance"
                  class="input input-bordered"
                />
              </div>

              <!-- User Max Daily Energy Replenishment -->
              <div class="form-control mb-4">
                <label
                  class="label"
                  for="max_daily_energy"
                >
                  <span class="label-text">Max Daily Energy Replenishment</span>
                </label>
                <input
                  id="max_daily_energy"
                  v-model="settings.maxDailyEnergyReplenishment"
                  type="number"
                  placeholder="Enter Max Daily Energy"
                  class="input input-bordered"
                />
              </div>

              <!-- User Max Offline Profit Hours -->
              <div class="form-control mb-4">
                <label
                  class="label"
                  for="max_offline_profit_hours"
                >
                  <span class="label-text">Max Offline Profit Hours</span>
                </label>
                <input
                  id="max_offline_profit_hours"
                  v-model="settings.maxOfflineProfitHours"
                  type="number"
                  placeholder="Enter Max Offline Profit Hours"
                  class="input input-bordered"
                />
              </div>

              <!-- User Referral Reward -->
              <div class="form-control mb-4">
                <label
                  class="label"
                  for="referral_reward"
                >
                  <span class="label-text">Referral Reward</span>
                </label>
                <input
                  id="referral_reward"
                  v-model="settings.referralReward"
                  type="number"
                  placeholder="Enter Referral Reward"
                  class="input input-bordered"
                />
              </div>

              <!-- User Daily Reward -->
              <div class="form-control mb-6">
                <label
                  class="label"
                  for="daily_reward"
                >
                  <span class="label-text">Daily Reward</span>
                </label>
                <input
                  id="daily_reward"
                  v-model="settings.dailyReward"
                  type="number"
                  placeholder="Enter Daily Reward"
                  class="input input-bordered"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <button
      class="btn btn-primary mt-4 w-full sticky bottom-0"
      :disabled="isLoading"
      @click="submitSettings"
    >
      Save
    </button>
  </div>

  <div v-else>
    Settings are not available
  </div>
</template>

<style>

</style>
