<script lang="ts" setup>
import { toast } from "vue3-toastify";
import { EarnTaskType } from "~/types";
import { EarnTaskDto } from "~/types/dto/earn";

definePageMeta({
    layout: "dashboard",
});

const isLoading = ref<boolean>(false);

function transformFn(tasks: EarnTaskDto[]): { task: EarnTaskDto; selected: boolean }[] {
    return tasks.map((task) => {
        return {
            task,
            selected: false,
        };
    });
}

const { data: tasks, error } = await useFetch("/api/earn/task-list", {
    transform: transformFn,
});
if (error.value) {
    toast.error("Failed to fetch earn tasks: " + getErrorMsg(error.value));
}

// Modal
const isModalOpen = ref<boolean>(false);
const selectedTask = ref<EarnTaskDto>(new EarnTaskDto());
const isNewTaskModal = ref<boolean>(false);
const isDeleteModalOpen = ref<boolean>(false);
const isDeleteSelectedTasksModal = ref<boolean>(false);

// Show/hide fields based on task type
const showUrlField = computed(() => {
    return [EarnTaskType.TELEGRAM_JOIN, EarnTaskType.X_FOLLOW, EarnTaskType.YOUTUBE_SUBSCRIBE].includes(
        selectedTask.value.type,
    );
});

const showCountField = computed(() => {
    return selectedTask.value.type === EarnTaskType.INVITE_FRIENDS;
});

function openEditModal(earnTask: EarnTaskDto): void {
    selectedTask.value = earnTask;
    isNewTaskModal.value = false;
    isModalOpen.value = true;
    isDeleteModalOpen.value = false;
    isDeleteSelectedTasksModal.value = false;
}

function openNewModal(): void {
    selectedTask.value = new EarnTaskDto();
    isNewTaskModal.value = true;
    isDeleteModalOpen.value = false;
    isModalOpen.value = true;
    isDeleteSelectedTasksModal.value = false;
}

function openDeleteModal(earnTask: EarnTaskDto): void {
    selectedTask.value = earnTask;
    isNewTaskModal.value = false;
    isModalOpen.value = false;
    isDeleteModalOpen.value = true;
    isDeleteSelectedTasksModal.value = false;
}

function openDeleteSelectedModal(): void {
    if (tasks.value?.filter(task => task.selected).length === 0) {
        return;
    }

    isNewTaskModal.value = false;
    isModalOpen.value = false;
    isDeleteModalOpen.value = false;
    isDeleteSelectedTasksModal.value = true;
}

async function editOrAddEarnTask(): Promise<void> {
    isLoading.value = true;

    try {
        await $fetch("/api/dashboard/earn-task", {
            method: isNewTaskModal.value ? "POST" : "PUT",
            body: {
                ...selectedTask.value,
            },
        });

        tasks.value = transformFn(await $fetch("/api/earn/task-list"));

        toast.success("Earn Task saved", { autoClose: 1000 });
        isModalOpen.value = false;
    } catch (error) {
        toast.error("Failed to edit or add Earn Task: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

async function deleteTasks(ids: number[]): Promise<void> {
    if (ids.length === 0) {
        return;
    }

    isLoading.value = true;

    try {
        await $fetch("/api/dashboard/earn-task", {
            method: "DELETE",
            body: ids,
        });

        tasks.value = transformFn(await $fetch("/api/earn/task-list"));

        toast.success("Earn Task deleted", { autoClose: 1000 });
        isDeleteModalOpen.value = false;
        isDeleteSelectedTasksModal.value = false;
    } catch (error) {
        toast.error("Failed to delete Earn Task: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

function deleteTask(taskId: number): Promise<void> {
    return deleteTasks([taskId]);
}

function deleteSelectedTasks(): Promise<void> {
    return deleteTasks(tasks.value?.filter(task => task.selected).map(task => task.task.id) ?? []);
}

// Table
function selectAllTasks(checked: boolean): void {
    for (const task of tasks.value!) {
        task.selected = checked;
    }
}
</script>

<template>
  <div class="flex flex-col grow drawer-content">
    <h3 class="text-lg font-bold">
      Earn Tasks
    </h3>

    <div class="card card-bordered grow mt-5 bg-base-100">
      <div class="card-body p-0">
        <!-- Table header -->
        <div class="flex items-center justify-between px-5 pt-5">
          <div class="inline-flex items-center gap-3" />

          <div class="inline-flex items-center gap-3">
            <button
              class="btn hidden sm:flex btn-sm btn-primary"
              @click="openNewModal"
            >
              <Icon
                name="mdi:plus"
                size="16"
              />
              <span>New Task</span>
            </button>

            <button
              class="btn flex btn-sm btn-error"
              :disabled="isLoading"
              @click="openDeleteSelectedModal"
            >
              <Icon
                name="mdi:minus"
                size="16"
              />
              <span>Delete Tasks</span>
            </button>
          </div>
        </div>

        <!-- Table -->
        <DashboardTable
          :columns="['Title', 'Type', 'Reward', 'Requirement', 'Created At', 'Action']"
          :selectable="true"
          @all-selected="selectAllTasks"
        >
          <tr
            v-for="taskInfo in tasks"
            :key="taskInfo.task.id"
            class="cursor-pointer hover:bg-base-200/40"
          >
            <th>
              <input
                v-model="taskInfo.selected"
                type="checkbox"
                class="checkbox checkbox-xs"
              />
            </th>

            <!-- Title -->
            <td>
              <div class="flex items-center space-x-3 truncate">
                <div class="font-medium">
                  {{ taskInfo.task.title }}
                </div>
              </div>
            </td>

            <!-- Type -->
            <td>
              <div class="font-medium">
                {{ taskInfo.task.type }}
              </div>
            </td>

            <!-- Reward -->
            <td>
              <div class="text-sm font-medium">
                {{ taskInfo.task.reward.toLocaleString("en-US") }}
              </div>
            </td>

            <!-- Requirement -->
            <td>
              <div class="text-sm font-medium">
                {{ taskInfo.task.url ?? taskInfo.task.count }}
              </div>
            </td>

            <!-- Created At -->
            <td>
              <div class="text-sm">
                {{ new Date(taskInfo.task.createdAt).toDateString() }}
              </div>
            </td>

            <!-- Action -->
            <td>
              <div class="inline-flex w-fit">
                <button
                  class="btn btn-sm btn-square btn-ghost"
                  @click="openEditModal(taskInfo.task)"
                >
                  <Icon
                    class="text-base-content/70"
                    name="mdi:pencil-outline"
                    size="20"
                  />
                </button>

                <button
                  class="btn text-error/70 hover:bg-error/20 btn-sm btn-square btn-ghost"
                  @click="openDeleteModal(taskInfo.task)"
                >
                  <Icon
                    name="ic:round-delete-outline"
                    size="20"
                  />
                </button>
              </div>
            </td>
          </tr>
        </DashboardTable>
      </div>
    </div>

    <DashboardModal v-model="isModalOpen">
      <h2 class="card-title text-lg font-bold mb-4">
        {{ selectedTask.title !== undefined ? "Edit Task" : "New Task" }}
      </h2>

      <form @submit.prevent="editOrAddEarnTask">
        <!-- Title -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="title"
          >
            <span class="label-text">Title</span>
          </label>
          <input
            id="title"
            v-model="selectedTask.title"
            type="text"
            placeholder="Enter Title"
            class="input input-bordered"
          />
        </div>

        <!-- Reward -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="reward"
          >
            <span class="label-text">Reward</span>
          </label>
          <input
            id="reward"
            v-model="selectedTask.reward"
            type="number"
            placeholder="Enter Reward"
            class="input input-bordered"
          />
        </div>

        <!-- Type -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="type"
          >
            <span class="label-text">Task Type</span>
          </label>
          <select
            id="type"
            v-model="selectedTask.type"
            class="select select-bordered"
          >
            <option value="telegram_join">
              Telegram Join
            </option>
            <option value="x_follow">
              X Follow
            </option>
            <option value="youtube_subscribe">
              YouTube Subscribe
            </option>
            <option value="invite_friends">
              Invite Friends
            </option>
          </select>
        </div>

        <!-- URL Field (shown for TELEGRAM_JOIN, X_FOLLOW, YOUTUBE_SUBSCRIBE) -->
        <div
          v-if="showUrlField"
          class="form-control mb-4"
        >
          <label
            class="label"
            for="url"
          >
            <span class="label-text">URL</span>
          </label>
          <input
            id="url"
            v-model="selectedTask.url"
            type="url"
            placeholder="Enter URL"
            class="input input-bordered"
          />
        </div>

        <!-- Count Field (shown for INVITE_FRIENDS) -->
        <div
          v-if="showCountField"
          class="form-control mb-4"
        >
          <label
            class="label"
            for="count"
          >
            <span class="label-text">Count</span>
          </label>
          <input
            id="count"
            v-model="selectedTask.count"
            type="number"
            placeholder="Enter Count"
            class="input input-bordered"
          />
        </div>

        <!-- Submit Button -->
        <div class="form-control">
          <button
            type="submit"
            class="btn btn-primary"
          >
            Save
          </button>
        </div>
      </form>
    </DashboardModal>

    <!-- Delete Confirm Modal -->
    <DashboardConfirmModal
      v-model="isDeleteModalOpen"
      :title="'Delete ' + selectedTask.title + '?'"
      sub-title="This action cannot be undone."
      sub-title-class="text-error"
      button-text="Confirm"
      button-class="btn-error"
      @confirm="deleteTask(selectedTask.id)"
    />

    <!-- Delete Selected Confirm Modal -->
    <DashboardConfirmModal
      v-model="isDeleteSelectedTasksModal"
      title="Delete selected tasks?"
      sub-title="This action cannot be undone."
      sub-title-class="text-error"
      button-text="Confirm"
      button-class="btn-error"
      @confirm="deleteSelectedTasks"
    />
  </div>
</template>

<style>

</style>
