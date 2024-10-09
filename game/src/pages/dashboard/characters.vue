<script lang="ts" setup>
import { toast } from "vue3-toastify";
import { CharacterDto } from "~/types/dto/character";

definePageMeta({
    layout: "dashboard",
});

const isLoading = ref<boolean>(false);
const isModalOpen = ref<boolean>(false);
const isDeleteModalOpen = ref<boolean>(false);
const selectedCharacter = ref<CharacterDto>(new CharacterDto());

const { data: characters, error } = await useFetch("/api/dashboard/characters");
if (error.value) {
    toast.error("Failed to fetch characters: " + getErrorMsg(error.value));
}

function openEditModal(character: CharacterDto): void {
    selectedCharacter.value = character;
    isModalOpen.value = true;
}

function openNewModal(): void {
    selectedCharacter.value = new CharacterDto();
    isModalOpen.value = true;
}

async function editOrAddCharacter(): Promise<void> {
    isLoading.value = true;

    try {
        await $fetch("/api/dashboard/character", {
            method: selectedCharacter.value.rank === undefined ? "POST" : "PUT",
            body: {
                ...selectedCharacter.value,
            },
        });

        characters.value = await $fetch("/api/dashboard/characters");

        toast.success("User level saved", { autoClose: 1000 });
        isModalOpen.value = false;
    } catch (error) {
        toast.error("Failed to edit or add user level: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

async function deleteCharacter(): Promise<void> {
    isLoading.value = true;

    try {
        await $fetch("/api/dashboard/character", {
            method: "DELETE",
        });

        characters.value = await $fetch("/api/dashboard/characters");

        toast.success("Character deleted", { autoClose: 1000 });
        isDeleteModalOpen.value = false;
    } catch (error) {
        toast.error("Failed to delete character: " + getErrorMsg(error));
    }

    isLoading.value = false;
}
</script>

<template>
  <div
    v-if="characters !== null"
    class="flex flex-col grow drawer-content"
  >
    <h3 class="text-lg font-bold">
      Characters
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
              <span>New Character</span>
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
              <span>Delete Character</span>
            </button>
          </div>
        </div>

        <DashboardTable :columns="['Rank', 'Name', 'Price', 'Profit Per Hour', 'Actions']">
          <tr
            v-for="character in characters"
            :key="character.rank"
            class="cursor-pointer hover:bg-base-300/40"
          >
            <!-- Rank -->
            <td>
              <div class="text-sm font-medium">
                {{ character.rank }}
              </div>
            </td>

            <!-- Name -->
            <td>
              <div class="flex items-center space-x-3 truncate">
                <div class="font-medium">
                  {{ character.name }}
                </div>
              </div>
            </td>

            <!-- Price -->
            <td>
              <div class="text-sm font-medium">
                {{ character.price.toLocaleString("en-US") }}
              </div>
            </td>

            <!-- Profit Per Hour -->
            <td>
              <div class="text-sm font-medium">
                {{ character.profitPerHour.toLocaleString("en-US") }}
              </div>
            </td>

            <!-- Action -->
            <td>
              <div class="inline-flex w-fit">
                <button
                  class="btn btn-sm btn-square btn-ghost"
                  :disabled="isLoading"
                  @click="openEditModal(character)"
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

    <!-- Character Model -->
    <DashboardModal v-model="isModalOpen">
      <h2 class="card-title text-lg font-bold mb-4">
        {{ selectedCharacter.rank !== undefined ? "Edit Character" : "New Character" }}
      </h2>

      <form @submit.prevent="editOrAddCharacter">
        <!-- Rank -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="rank"
          >
            <span class="label-text">Rank</span>
          </label>
          <input
            id="rank"
            v-model="selectedCharacter.rank"
            type="number"
            placeholder="Enter Rank"
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
            v-model="selectedCharacter.name"
            type="text"
            placeholder="Enter Name"
            class="input input-bordered"
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
            v-model="selectedCharacter.price"
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
            v-model="selectedCharacter.profitPerHour"
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
            {{ selectedCharacter.rank !== undefined ? "Save" : "Add" }}
          </button>
        </div>
      </form>
    </DashboardModal>

    <!-- Delete Confirm Model -->
    <DashboardConfirmModal
      v-model="isDeleteModalOpen"
      title="Delete hights rank character?"
      sub-title="This action cannot be undone."
      sub-title-class="text-error"
      button-text="Confirm"
      button-class="btn-error"
      @confirm="deleteCharacter"
    />
  </div>

  <div v-else>
    Characters not found
  </div>
</template>

<style>
</style>
