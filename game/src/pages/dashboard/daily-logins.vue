<script lang="ts" setup>
import { toast } from "vue3-toastify";
import { DailyLoginRewardDto } from "~/types/dto";

definePageMeta({
    layout: "dashboard",
});

const isLoading = ref<boolean>(false);
const isModalOpen = ref<boolean>(false);
const isDeleteModalOpen = ref<boolean>(false);
const selectedDailyLogin = ref<DailyLoginRewardDto>(new DailyLoginRewardDto());

const { data: dailiesInfo, error } = await useFetch("/api/dailies");
if (error.value) {
    toast.error("Failed to fetch dailies: " + getErrorMsg(error.value));
}

function openEditModal(dailyLogin: DailyLoginRewardDto): void {
    selectedDailyLogin.value = dailyLogin;
    isModalOpen.value = true;
}

function openNewModal(): void {
    selectedDailyLogin.value = new DailyLoginRewardDto();
    selectedDailyLogin.value.spcialDay = false;
    isModalOpen.value = true;
}

async function editOrAddDailyLogin(): Promise<void> {
    isLoading.value = true;

    try {
        await $fetch("/api/dashboard/daily-login", {
            method: selectedDailyLogin.value.day === undefined ? "POST" : "PUT",
            body: {
                day: selectedDailyLogin.value.day,
                reward: selectedDailyLogin.value.reward,
                spcialDay: selectedDailyLogin.value.spcialDay,
            },
        });

        dailiesInfo.value = await $fetch("/api/dailies");

        toast.success("Daily login saved", { autoClose: 1000 });
        isModalOpen.value = false;
    } catch (error) {
        toast.error("Failed to edit or add daily login: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

async function deleteDailyLogin(): Promise<void> {
    isLoading.value = true;

    try {
        await $fetch("/api/dashboard/daily-login", {
            method: "DELETE",
        });

        dailiesInfo.value = await $fetch("/api/dailies");

        toast.success("Daily login deleted", { autoClose: 1000 });
        isDeleteModalOpen.value = false;
    } catch (error) {
        toast.error("Failed to delete Daily login: " + getErrorMsg(error));
    }

    isLoading.value = false;
}
</script>

<template>
  <div
    v-if="dailiesInfo !== null"
    class="flex flex-col grow drawer-content"
  >
    <h3 class="text-lg font-bold">
      Daily Logins
    </h3>

    <div class="card card-bordered grow bg-base-100 mt-5">
      <div class="card-body p-0">
        <!-- Table header -->
        <div class="flex items-center justify-between px-5 pt-5">
          <div class="inline-flex items-center gap-3" />

          <div class="inline-flex items-center gap-3">
            <button
              class="btn flex btn-sm btn-primary"
              :disabled="isLoading"
              @click="openNewModal"
            >
              <Icon
                name="mdi:plus"
                size="16"
              />
              <span>New Day</span>
            </button>

            <button
              class="btn flex btn-sm btn-error"
              :disabled="isLoading"
              @click="isDeleteModalOpen = true"
            >
              <Icon
                name="mdi:minus"
                size="16"
              />
              <span>Delete Day</span>
            </button>
          </div>
        </div>

        <DashboardTable :columns="['Day', 'Reward', 'SpcialDay', 'Actions']">
          <tr
            v-for="day in dailiesInfo.dailies"
            :key="day.day"
            class="cursor-pointer hover:bg-base-300/40"
          >
            <!-- Day -->
            <td>
              <div class="font-medium">
                {{ day.day }}
              </div>
            </td>

            <!-- Reward -->
            <td>
              <div class="text-sm font-medium">
                {{ day.reward.toLocaleString("en-US") }}
              </div>
            </td>

            <!-- SpcialDay -->
            <td>
              <div class="flex items-center gap-2">
                <div
                  aria-label="Badge"
                  class="badge border-0 font-medium capitalize"
                  :class="[
                    day.spcialDay ? 'bg-success/10 text-success' : 'bg-error/10 text-error',
                  ]"
                >
                  {{ day.spcialDay ? "Yes" : "No" }}
                </div>
              </div>
            </td>

            <!-- Action -->
            <td>
              <div class="inline-flex w-fit">
                <button
                  class="btn btn-sm btn-square btn-ghost"
                  :disabled="isLoading"
                  @click="openEditModal(day)"
                >
                  <Icon
                    class="text-base-content/70"
                    name="mdi:pencil-outline"
                    size="20"
                  />
                </button>
              </div>
            </td>
          </tr>
        </DashboardTable>
      </div>
    </div>

    <!-- Daily Login Modal -->
    <DashboardModal v-model="isModalOpen">
      <h2 class="card-title text-lg font-bold mb-4">
        {{ selectedDailyLogin.day !== undefined ? "Edit Daily Login" : "New Daily Login" }}
      </h2>

      <form @submit.prevent="editOrAddDailyLogin">
        <!-- day -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="day"
          >
            <span class="label-text">Day</span>
          </label>
          <input
            id="day"
            v-model="selectedDailyLogin.day"
            type="number"
            placeholder="Enter Day"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Balance Reward -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="balance_reward"
          >
            <span class="label-text">Balance Reward</span>
          </label>
          <input
            id="balance_reward"
            v-model="selectedDailyLogin.reward"
            type="number"
            placeholder="Enter Balance Reward"
            class="input input-bordered"
          />
        </div>

        <!-- Spcial Day -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="spcial_day"
          >
            <span class="label-text">Spcial Day</span>
            <input
              id="spcial_day"
              v-model="selectedDailyLogin.spcialDay"
              type="checkbox"
              class="checkbox"
            />
          </label>
        </div>

        <!-- Submit Button -->
        <div class="form-control">
          <button
            class="btn btn-primary"
            :disabled="isLoading"
          >
            {{ selectedDailyLogin.day !== undefined ? "Save" : "Add" }}
          </button>
        </div>
      </form>
    </DashboardModal>

    <!-- Delete Confirm Model -->
    <DashboardConfirmModal
      v-model="isDeleteModalOpen"
      title="Delete last daily Login?"
      sub-title="This action cannot be undone."
      sub-title-class="text-error"
      button-text="Confirm"
      button-class="btn-error"
      @confirm="deleteDailyLogin"
    />
  </div>

  <div v-else>
    Daily Logins not found
  </div>
</template>

<style>
</style>
