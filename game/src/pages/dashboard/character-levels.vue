<script lang="ts" setup>
import { toast } from "vue3-toastify";
import { CharacterLevelDto } from "~/types/dto/character";

definePageMeta({
    layout: "dashboard",
});

const isLoading = ref<boolean>(false);
const isModalOpen = ref<boolean>(false);
const isDeleteModalOpen = ref<boolean>(false);
const selectedCharacterRank = ref<number>(1);
const selectedCharacterLevel = ref<CharacterLevelDto>(new CharacterLevelDto());

const { data: characterLevelsInfo, error } = await useFetch(`/api/dashboard/character-levels?rank=${selectedCharacterRank.value}`);
if (error.value) {
    toast.error("Failed to fetch character levels: " + getErrorMsg(error.value));
}

function openEditModal(characterLevel: CharacterLevelDto): void {
    selectedCharacterLevel.value = characterLevel;
    isModalOpen.value = true;
}

function openNewModal(): void {
    selectedCharacterLevel.value = new CharacterLevelDto();
    isModalOpen.value = true;
}

async function fetchCharacterLevels(rank: number): Promise<void> {
    if (rank < 1) {
        toast.error("Page must be greater than or equal to 1");
        return;
    }

    isLoading.value = true;
    try {
        characterLevelsInfo.value = await $fetch(`/api/dashboard/character-levels?rank=${rank}`);
    } catch (error) {
        toast.error("Failed to fetch character levels: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

async function editOrAddCharacterLevel(): Promise<void> {
    isLoading.value = true;

    try {
        await $fetch(`/api/dashboard/character-level?rank=${selectedCharacterRank.value}`, {
            method: selectedCharacterLevel.value.level === undefined ? "POST" : "PUT",
            body: {
                ...selectedCharacterLevel.value,
            },
        });

        characterLevelsInfo.value = await $fetch(`/api/dashboard/character-levels?rank=${selectedCharacterRank.value}`);

        toast.success("Character level saved", { autoClose: 1000 });
        isModalOpen.value = false;
    } catch (error) {
        toast.error("Failed to edit or add character level: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

async function deleteCharacterLevel(): Promise<void> {
    isLoading.value = true;

    try {
        await $fetch(`/api/dashboard/character-level?rank=${selectedCharacterRank.value}`, {
            method: "DELETE",
        });

        characterLevelsInfo.value = await $fetch(`/api/dashboard/character-levels?rank=${selectedCharacterRank.value}`);

        toast.success("Character level deleted", { autoClose: 1000 });
        isDeleteModalOpen.value = false;
    } catch (error) {
        toast.error("Failed to delete character level: " + getErrorMsg(error));
    }

    isLoading.value = false;
}
</script>

<template>
  <div
    v-if="characterLevelsInfo !== null"
    class="flex flex-col grow drawer-content"
  >
    <h3 class="text-lg font-bold">
      Character Levels
    </h3>

    <div class="card card-bordered grow bg-base-100 mt-5">
      <div class="card-body p-0">
        <!-- Table header -->
        <div class="flex items-center justify-between px-5 pt-5">
          <div class="inline-flex items-center gap-3 grow">
            <span class="label-text max-w-xs">Character Rank:</span>
            <select
              v-model="selectedCharacterRank"
              :disabled="isLoading"
              class="select select-bordered select-sm max-w-fit"
              @change="fetchCharacterLevels(selectedCharacterRank)"
            >
              <option
                v-for="i in characterLevelsInfo.maxRankCharacter"
                :key="i"
                :value="i"
              >
                Rank {{ i }}
              </option>
            </select>
          </div>

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

        <DashboardTable :columns="['Level', 'Price', 'Profit', 'Profit View Only', 'Actions']">
          <tr
            v-for="level in characterLevelsInfo.levels"
            :key="level.level"
            class="cursor-pointer hover:bg-base-300/40"
          >
            <!-- Level -->
            <td>
              <div class="font-medium">
                {{ level.level }}
              </div>
            </td>

            <!-- Price -->
            <td>
              <div class="text-sm font-medium">
                {{ level.price.toLocaleString("en-US") }}
              </div>
            </td>

            <!-- Profit -->
            <td>
              <div class="text-sm font-medium">
                {{ level.profitPerHour.toLocaleString("en-US") }}
              </div>
            </td>

            <!-- Profit View Only -->
            <td>
              <div class="text-sm font-medium">
                {{ level.profitPerHourViewOnly.toLocaleString("en-US") }}
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
        {{ selectedCharacterLevel.level !== undefined ? "Edit Level" : "New Level" }}
      </h2>

      <form @submit.prevent="editOrAddCharacterLevel">
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
            v-model="selectedCharacterLevel.level"
            type="number"
            placeholder="Enter Level"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Price -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="price"
          >
            <span class="label-text">Price</span>
          </label>
          <input
            id="price"
            v-model="selectedCharacterLevel.price"
            type="number"
            placeholder="Enter Price"
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
            v-model="selectedCharacterLevel.profitPerHour"
            type="number"
            placeholder="Enter Profit Per Hour"
            class="input input-bordered"
          />
        </div>

        <!-- Profit Per Hour View Only -->
        <div class="form-control mb-6">
          <label
            class="label"
            for="profit_per_hour_view_only"
          >
            <span class="label-text">Profit Per Hour View Only</span>
          </label>
          <input
            id="profit_per_hour_view_only"
            v-model="selectedCharacterLevel.profitPerHourViewOnly"
            type="number"
            placeholder="Enter Profit Per Hour View Only"
            class="input input-bordered"
          />
        </div>

        <!-- Submit Button -->
        <div class="form-control">
          <button
            class="btn btn-primary"
            :disabled="isLoading"
          >
            {{ selectedCharacterLevel.level !== undefined ? "Save" : "Add" }}
          </button>
        </div>
      </form>
    </DashboardModal>

    <!-- Delete Confirm Model -->
    <DashboardConfirmModal
      v-model="isDeleteModalOpen"
      :title="`Delete last character(rank ${selectedCharacterRank}) level?`"
      sub-title="This action cannot be undone."
      sub-title-class="text-error"
      button-text="Confirm"
      button-class="btn-error"
      @confirm="deleteCharacterLevel"
    />
  </div>

  <div v-else>
    Character levels not found
  </div>
</template>

<style>
</style>
