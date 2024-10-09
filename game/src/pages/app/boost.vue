<script lang="ts" setup>
import { toast } from "vue3-toastify";
import { BoosterType } from "~/types";

definePageMeta({
    layout: "app-logged-in",
});

const isLoading = ref<boolean>(false);
const { user, sync: userSync } = useUser();

// Boosters
const isFreeDailyPopupOpen = ref<boolean>(false);
const isPaidDailyPopupOpen = ref<boolean>(false);
const selectedPaidDaily = ref<BoosterType | null>(null);
const nextEnergyReplenishmentCountDown = ref<string | undefined>(undefined);
const { data: status, error } = await useFetch("/api/user/booster/status");

if (error.value) {
    toast.error("Failed to fetch boosters: " + getErrorMsg(error.value));
}

const nextClickPowerLevel = computed<{ level: number; price: number } | undefined>(() => {
    if (status.value === null) {
        return undefined;
    }

    return status.value.clickPowerLevels.find(lvl => lvl.level === status.value!.curClickPowerLevel + 1);
});

const nextClickPowerLevelPrice = computed<string | undefined>(() => {
    if (nextClickPowerLevel.value === undefined) {
        return undefined;
    }

    return numberFriendlyName(nextClickPowerLevel.value.price) ?? undefined;
});

const nextEnergyLimitLevel = computed<{ level: number; price: number } | undefined>(() => {
    if (status.value === null) {
        return undefined;
    }

    return status.value.energyLimitLevels.find(lvl => lvl.level === status.value!.curEnergyLimitLevel + 1);
});

const nextEnergyLimitLevelPrice = computed<string | undefined>(() => {
    if (nextEnergyLimitLevel.value === undefined) {
        return undefined;
    }

    return numberFriendlyName(nextEnergyLimitLevel.value.price) ?? undefined;
});

const { pause: pauseEnergyReplenishmentCounter, resume: resumeEnergyReplenishmentCounter } = useIntervalFn(() => {
    nextEnergyReplenishmentCountDown.value = getNextEnergyReplenishment();
}, 1000, { immediate: false });

if (status.value!.canUseEnergyReplenishment) {
    pauseEnergyReplenishmentCounter();
} else {
    resumeEnergyReplenishmentCounter();
}

function openPaidDailyPopup(boosterType: BoosterType): void {
    isPaidDailyPopupOpen.value = true;
    selectedPaidDaily.value = boosterType;
}

async function useEnergyReplenishment(): Promise<void> {
    if (user.value === null || status.value === null) {
        return;
    }

    if (!status.value.canUseEnergyReplenishment) {
        return;
    }

    if (status.value.canUseEnergyReplenishment && user.value.energy === user.value.energyLimit) {
        toast.error("Energy is already full");
        return;
    }

    isLoading.value = true;
    try {
        await $fetch("/api/user/booster/use-energy-replenishment", {
            method: "POST",
        });

        await userSync(0);
        status.value = await $fetch("/api/user/booster/status");
        isFreeDailyPopupOpen.value = false;
        resumeEnergyReplenishmentCounter();
        toast.success("Energy replenishment used", { autoClose: 1000 });
    } catch (error) {
        toast.error("Failed to use EnergyReplenishment: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

async function upgradeBoost(boostType: BoosterType): Promise<void> {
    if (user.value === null) {
        return;
    }

    if (boostType === BoosterType.ClickPower) {
        if (nextClickPowerLevel.value === undefined) {
            return;
        }

        if (user.value.balance < nextClickPowerLevel.value.price) {
            toast.error("Not enough balance");
            return;
        }
    } else if (boostType === BoosterType.EnergyLimit) {
        if (nextEnergyLimitLevel.value === undefined) {
            return;
        }

        if (user.value.balance < nextEnergyLimitLevel.value.price) {
            toast.error("Not enough balance");
            return;
        }
    } else {
        toast.error("Unknown boost type: " + boostType);
        return;
    }

    isLoading.value = true;
    try {
        await $fetch(`/api/user/booster/${boostType}/upgrade`, {
            method: "POST",
        });

        await userSync(0);
        status.value = await $fetch("/api/user/booster/status");
        isPaidDailyPopupOpen.value = false;
        toast.success("Upgrade success", { autoClose: 1000 });
    } catch (error) {
        toast.error("Failed to upgrade booster: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

function getNextEnergyReplenishment(): string | undefined {
    if (user.value === null || user.value.dailyEnergyReplenishmentClaimedDayTime === undefined) {
        return undefined;
    }

    return getFormattedDateDiff(
        user.value!.dailyEnergyReplenishmentClaimedDayTime + (1000 * 60 * 60),
        Date.now(),
    );
}
</script>

<template>
  <section
    v-if="status !== null && user !== null"
    class="flex flex-col my-auto mx-2"
  >
    <!-- Free Daily Popup -->
    <AppPopup
      v-model="isFreeDailyPopupOpen"
      title=""
    >
      <div class="flex flex-col items-center select-none">
        <img
          class="object-contain h-28 mx-auto pointer-events-none"
          src="~/assets/img/icons/full-energy.png"
        />

        <span class="text-2xl font-bold text-yellow-300 py-1 mt-8">Energy Replishment</span>
        <span class="text-lg font-normal pb-1">Refill your energy</span>

        <!-- Price -->
        <div class="flex flex-col justify-center items-center mt-6 mb-3">
          <div class="flex justify-center items-center gap-4">
            <img
              class="object-contain h-10 pointer-events-none"
              src="~/assets/img/icons/coin.png"
            />

            <span class="text-3xl font-bold mb-1">
              Free
            </span>
          </div>

          <span class="text-md font-light">
            Once per hour
          </span>
        </div>

        <!-- Button -->
        <button
          class="flex items-center justify-center w-full text-white rounded-full
            bg-[#002AFF] hover:bg-blue-700 ring-1 ring-blue-500 disabled:bg-blue-900/50 disabled:hover:bg-blue-900/50"
          :disabled="!status.canUseEnergyReplenishment || isLoading"
          @click="useEnergyReplenishment"
        >
          <span
            v-if="status.canUseEnergyReplenishment"
            class="my-4 font-extrabold text-3xl p-1"
          >
            Use
          </span>
          <span
            v-else
            class="my-4 font-extrabold text-md p-1"
          >
            Avilable After {{ nextEnergyReplenishmentCountDown }}
          </span>
        </button>
      </div>
    </AppPopup>

    <!-- Popup -->
    <AppPopup
      v-model="isPaidDailyPopupOpen"
      title=""
    >
      <div
        v-if="selectedPaidDaily !== null"
        class="flex flex-col items-center select-none"
      >
        <img
          v-if="selectedPaidDaily === BoosterType.ClickPower"
          class="object-contain h-28 mx-auto pointer-events-none"
          src="~/assets/img/icons/multi-tap.png"
        />

        <img
          v-if="selectedPaidDaily === BoosterType.EnergyLimit"
          class="object-contain h-28 mx-auto pointer-events-none"
          src="~/assets/img/icons/energy-limit.png"
        />

        <!-- Title -->
        <span class="text-3xl font-bold text-yellow-300 pb-1 mt-8">
          <template v-if="selectedPaidDaily === BoosterType.ClickPower">
            Click Power
          </template>

          <template v-else-if="selectedPaidDaily === BoosterType.EnergyLimit">
            Energy Limit
          </template>

          <template v-else>
            Not Valid Booster. Please contact support.
          </template>
        </span>

        <!-- Description -->
        <span class="text-lg font-normal pb-1">
          <template v-if="selectedPaidDaily === BoosterType.ClickPower">
            Increase click power
          </template>

          <template v-else-if="selectedPaidDaily === BoosterType.EnergyLimit">
            Increase max energy limit
          </template>

          <template v-else>
            Not Valid Booster. Please contact support.
          </template>
        </span>

        <!-- Profit -->
        <template v-if="selectedPaidDaily === BoosterType.ClickPower && nextClickPowerLevel !== undefined">
          <span class="text-lg">Coins per click</span>
          <div class="flex justify-center items-center gap-1">
            <img
              class="object-contain h-6 pointer-events-none"
              src="~/assets/img/icons/tap.png"
            />

            <span class="text-lg font-bold">
              +1
            </span>
          </div>
        </template>

        <template v-if="selectedPaidDaily === BoosterType.EnergyLimit && nextEnergyLimitLevel !== undefined">
          <span class="text-lg">Energy Limit</span>
          <div class="flex justify-center items-center gap-1">
            <img
              class="object-contain h-6 pointer-events-none"
              src="~/assets/img/icons/energy-limit.png"
            />

            <span class="text-lg font-bold">
              +100
            </span>
          </div>
        </template>

        <!-- Price -->
        <div
          v-if="selectedPaidDaily === BoosterType.ClickPower && nextClickPowerLevel !== undefined
            || selectedPaidDaily === BoosterType.EnergyLimit && nextEnergyLimitLevel !== undefined
          "
          class="flex justify-center items-center gap-4 mt-6 mb-3"
        >
          <img
            class="object-contain h-10 pointer-events-none"
            src="~/assets/img/icons/coin.png"
          />

          <span class="text-3xl font-bold mb-1">
            <template v-if="selectedPaidDaily === BoosterType.ClickPower">
              {{ nextClickPowerLevelPrice }}
            </template>

            <template v-else-if="selectedPaidDaily === BoosterType.EnergyLimit">
              {{ nextEnergyLimitLevelPrice }}
            </template>

            <template v-else>
              Not Valid Booster. Please contact support.
            </template>
          </span>
        </div>

        <span
          v-else
          class="text-3xl font-bold"
        >
          Max Level
        </span>

        <!-- Button -->
        <button
          v-if="selectedPaidDaily === BoosterType.ClickPower && nextClickPowerLevel !== undefined
            || selectedPaidDaily === BoosterType.EnergyLimit && nextEnergyLimitLevel !== undefined
          "
          class="flex items-center justify-center w-full text-white rounded-full text-center
            bg-[#002AFF] hover:bg-blue-700 ring-1 ring-blue-500 disabled:bg-blue-900/50 disabled:hover:bg-blue-900/50"
          :disabled="isLoading"
          @click="upgradeBoost(selectedPaidDaily)"
        >
          <span class="flex items-center justify-center gap-2 my-2 font-extrabold text-xl h-10">
            <template v-if="isLoading">
              <Icon
                name="bx:loader-alt"
                class="animate-spin h-8 w-8 mt-1"
              />
              Processing...
            </template>
            <template v-else>
              Upgrade
            </template>
          </span>
        </button>
      </div>

      <div v-else>
        Select a booster to see more details
      </div>
    </AppPopup>

    <!-- Free daily booster -->
    <section class="mb-12">
      <span class="text-2xl font-extrabold pb-1">Free daily booster</span>
      <button
        class="flex items-center gap-2 mx-2 py-2 px-4 rounded-3xl border-2 bg-[#0b30ed] border-black/50 w-full"
        :disabled="isLoading"
        @click="isFreeDailyPopupOpen = true"
      >
        <img
          class="object-contain w-10 h-10 pointer-events-none"
          src="~/assets/img/icons/full-energy.png"
        />

        <div class="flex items-center justify-between w-full">
          <div class="flex flex-col items-start w-full">
            <span class="text-lg font-bold">Energy Replenishment</span>
            <span class="text-md font-light">
              {{ status.energyReplenishment - status.energyReplenishmentUsed }}/{{ status.energyReplenishment }} Available
            </span>
          </div>

          <Icon
            name="mdi:chevron-right"
            class="w-14 h-14"
          />
        </div>
      </button>
    </section>

    <!-- Boosters -->
    <section>
      <span class="text-2xl font-extrabold pb-1">Boosters</span>
      <div class="space-y-6">
        <!-- Tap Power -->
        <button
          class="flex items-center gap-2 mx-2 py-2 px-4 rounded-3xl border-2 bg-[#0b30ed] border-black/50 w-full"
          :disabled="isLoading"
          @click="openPaidDailyPopup(BoosterType.ClickPower)"
        >
          <img
            class="object-contain w-10 h-10 pointer-events-none"
            src="~/assets/img/icons/multi-tap.png"
          />

          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col items-start">
              <span class="text-lg font-bold">Tap Power</span>

              <div class="flex items-center gap-2">
                <img
                  class="h-6 pointer-events-none"
                  src="~/assets/img/icons/coin.png"
                />

                <span class="text-lg font-bold">
                  <template v-if="nextClickPowerLevel !== undefined">
                    {{ nextClickPowerLevelPrice }}
                  </template>
                  <template v-else>
                    Max
                  </template>
                </span>
              </div>
            </div>

            <div class="flex items-center">
              <span class="text-md font-light">Level {{ status.curClickPowerLevel }}</span>
              <Icon
                name="mdi:chevron-right"
                class="w-14 h-14"
              />
            </div>
          </div>
        </button>

        <!-- Energy Limit -->
        <button
          class="flex items-center gap-2 mx-2 py-2 px-4 rounded-3xl border-2 bg-[#0b30ed] border-black/50 w-full"
          :disabled="isLoading"
          @click="openPaidDailyPopup(BoosterType.EnergyLimit)"
        >
          <img
            class="object-contain w-10 h-10 pointer-events-none"
            src="~/assets/img/icons/energy-limit.png"
          />

          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col items-start">
              <span class="text-lg font-bold">Energy Limit</span>

              <div class="flex items-center gap-2">
                <img
                  class="h-6 pointer-events-none"
                  src="~/assets/img/icons/coin.png"
                />

                <span class="text-lg font-bold">
                  <template v-if="nextEnergyLimitLevel !== undefined">
                    {{ nextEnergyLimitLevelPrice }}
                  </template>
                  <template v-else>
                    Max
                  </template>
                </span>
              </div>
            </div>

            <div class="flex items-center">
              <span class="text-md font-light">Level {{ status.curEnergyLimitLevel }}</span>
              <Icon
                name="mdi:chevron-right"
                class="w-14 h-14"
              />
            </div>
          </div>
        </button>
      </div>
    </section>

    <div class="h-20" />
  </section>

  <div v-else-if="user === null">
    User not logged in
  </div>

  <div v-else>
    Failed to load boosters. Please try again later.
  </div>
</template>

<style>

</style>
