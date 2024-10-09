<script lang="ts" setup>
import { toast } from "vue3-toastify";
import { UserLevelDto } from "~/types/dto/user";

definePageMeta({
    layout: "dashboard",
});

const isLoading = ref<boolean>(false);
const isModalOpen = ref<boolean>(false);
const isDeleteModalOpen = ref<boolean>(false);
const selectedUserLevel = ref<UserLevelDto>(new UserLevelDto());

const { data: levels, error } = await useFetch("/api/dashboard/user-levels");
if (error.value) {
    toast.error("Failed to fetch user levels: " + getErrorMsg(error.value));
}

function openEditModal(userLevel: UserLevelDto): void {
    selectedUserLevel.value = userLevel;
    isModalOpen.value = true;
}

function openNewModal(): void {
    selectedUserLevel.value = new UserLevelDto();
    isModalOpen.value = true;
}

async function editOrAddUserLevel(): Promise<void> {
    isLoading.value = true;

    try {
        await $fetch("/api/dashboard/user-level", {
            method: selectedUserLevel.value.level === undefined ? "POST" : "PUT",
            body: {
                ...selectedUserLevel.value,
            },
        });

        levels.value = await $fetch("/api/dashboard/user-levels");

        toast.success("User level saved", { autoClose: 1000 });
        isModalOpen.value = false;
    } catch (error) {
        toast.error("Failed to edit or add user level: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

async function deleteLevel(): Promise<void> {
    isLoading.value = true;

    try {
        await $fetch("/api/dashboard/user-level", {
            method: "DELETE",
        });

        levels.value = await $fetch("/api/dashboard/user-levels");

        toast.success("User level deleted", { autoClose: 1000 });
        isDeleteModalOpen.value = false;
    } catch (error) {
        toast.error("Failed to delete user level: " + getErrorMsg(error));
    }

    isLoading.value = false;
}
</script>

<template>
  <div
    v-if="levels !== null"
    class="flex flex-col grow drawer-content"
  >
    <h3 class="text-lg font-bold">
      User Levels
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
              <span>New Level</span>
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
              <span>Delete Level</span>
            </button>
          </div>
        </div>

        <DashboardTable :columns="['Level', 'Name', 'Reward', 'Require', 'Profit Per Hour', 'Actions']">
          <tr
            v-for="level in levels"
            :key="level.level"
            class="cursor-pointer hover:bg-base-300/40"
          >
            <!-- Level -->
            <td>
              <div class="font-medium">
                {{ level.level }}
              </div>
            </td>

            <!-- Name -->
            <td>
              <div class="flex items-center space-x-3 truncate">
                <div class="font-medium">
                  {{ level.name }}
                </div>
              </div>
            </td>

            <!-- Reward -->
            <td>
              <div class="text-sm font-medium">
                {{ level.balanceReward.toLocaleString("en-US") }}
              </div>
            </td>

            <!-- Require -->
            <td>
              <div class="text-sm font-medium">
                {{ level.requiredBalance.toLocaleString("en-US") }}
              </div>
            </td>

            <!-- Profit Per Hour -->
            <td>
              <div class="text-sm font-medium">
                {{ level.profitPerHour.toLocaleString("en-US") }}
              </div>
            </td>

            <!-- Action -->
            <td>
              <div class="inline-flex w-fit">
                <button
                  class="btn btn-sm btn-square btn-ghost"
                  :disabled="isLoading"
                  @click="openEditModal(level)"
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

    <!-- Level Model -->
    <DashboardModal v-model="isModalOpen">
      <h2 class="card-title text-lg font-bold mb-4">
        {{ selectedUserLevel.level !== undefined ? "Edit Level" : "New Level" }}
      </h2>

      <form @submit.prevent="editOrAddUserLevel">
        <!-- Level -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="level"
          >
            <span class="label-text">Level</span>
          </label>
          <input
            id="level"
            v-model="selectedUserLevel.level"
            type="number"
            placeholder="Enter Level"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Name -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="name"
          >
            <span class="label-text">Name</span>
          </label>
          <input
            id="name"
            v-model="selectedUserLevel.name"
            type="text"
            placeholder="Enter Name"
            class="input input-bordered"
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
            v-model="selectedUserLevel.balanceReward"
            type="number"
            placeholder="Enter Balance Reward"
            class="input input-bordered"
          />
        </div>

        <!-- Required Balance -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="required_balance"
          >
            <span class="label-text">Required Balance</span>
          </label>
          <input
            id="required_balance"
            v-model="selectedUserLevel.requiredBalance"
            type="number"
            placeholder="Enter Required Balance"
            class="input input-bordered"
          />
        </div>

        <!-- Profit Per Hour -->
        <div class="form-control mb-6">
          <label
            class="label"
            for="profit_per_hour"
          >
            <span class="label-text">Profit Per Hour</span>
          </label>
          <input
            id="profit_per_hour"
            v-model="selectedUserLevel.profitPerHour"
            type="number"
            placeholder="Enter Profit Per Hour"
            class="input input-bordered"
          />
        </div>

        <!-- Submit Button -->
        <div class="form-control">
          <button
            class="btn btn-primary"
            :disabled="isLoading"
          >
            {{ selectedUserLevel.level !== undefined ? "Save" : "Add" }}
          </button>
        </div>
      </form>
    </DashboardModal>

    <!-- Delete Confirm Model -->
    <DashboardConfirmModal
      v-model="isDeleteModalOpen"
      title="Delete last user Level?"
      sub-title="This action cannot be undone."
      sub-title-class="text-error"
      button-text="Confirm"
      button-class="btn-error"
      @confirm="deleteLevel"
    />
  </div>

  <div v-else>
    User levels not found
  </div>
</template>

<style>
</style>
