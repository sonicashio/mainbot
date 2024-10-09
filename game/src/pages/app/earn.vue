<script lang="ts" setup>
import { toast } from "vue3-toastify";
import { EarnTaskType } from "~/types";
import type { EarnTaskDto } from "~/types/dto/earn";

definePageMeta({
    layout: "app-logged-in",
});

const { user, sync: userSync } = useUser();

// Earnings
interface EarnTask {
    id: number;
    icon: string;
    title: string;
    reward: number;
    completed: boolean;
    url?: string;
    openUrlOnCheck?: boolean;
}

const isLoading = ref<boolean>(false);
const isPopupOpen = ref<boolean>(false);
const selectedTask = ref<EarnTask | null>(null);

const icons: Record<string, string> = useIconsAssets();
function transfromTasks(tasks: EarnTaskDto[]): EarnTask[] {
    return tasks.map((task: EarnTaskDto): EarnTask => {
        let icon: string;
        let openUrlOnCheck: boolean | undefined;
        switch (task.type) {
            case EarnTaskType.TELEGRAM_JOIN:
                icon = "telegram";
                break;

            case EarnTaskType.X_FOLLOW:
                icon = "x";
                openUrlOnCheck = true;
                break;

            case EarnTaskType.YOUTUBE_SUBSCRIBE:
                icon = "youtube";
                openUrlOnCheck = true;
                break;

            case EarnTaskType.INVITE_FRIENDS:
                icon = task.count !== undefined && task.count > 1 ? "friends" : "invite-friend";
                break;

            default:
                throw new Error("Unknown earn task type: " + task.type);
        }

        return {
            id: task.id,
            icon: icon,
            title: task.title,
            reward: task.reward,
            completed: task.completed,
            url: task.url,
            openUrlOnCheck: openUrlOnCheck,
        };
    });
}
const { data: tasks, error } = await useFetch("/api/earn/task-list", {
    transform: transfromTasks,
});

if (error.value) {
    toast.error("Failed to fetch earn tasks: " + getErrorMsg(error.value));
}

function openPopup(task: EarnTask): void {
    selectedTask.value = task;
    isPopupOpen.value = true;
}

async function checkTask(): Promise<void> {
    if (user.value === null || selectedTask.value === null) {
        return;
    }

    if (selectedTask.value.completed) {
        toast.error("Task reward already claimed");
        return;
    }

    if (selectedTask.value.openUrlOnCheck && selectedTask.value.url !== undefined) {
        openLink(selectedTask.value.url);
    }

    isLoading.value = true;
    try {
        await $fetch("/api/user/complete-earn-task", {
            method: "POST",
            body: {
                taskId: selectedTask.value.id,
            },
        });

        await userSync(0);
        tasks.value = transfromTasks(await $fetch("/api/earn/task-list")!);
        selectedTask.value = tasks.value.find(task => task.id === selectedTask.value!.id) ?? null;
        toast.success("Task reward claimed", { autoClose: 1000 });
    } catch (error) {
        toast.error("Failed to check task: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

// Telegram
const { useWebAppNavigation } = await import("vue-tg");
const { openLink } = useWebAppNavigation();
</script>

<template>
  <section class="flex flex-col grow mx-2 select-none">
    <!-- Popup -->
    <AppPopup
      v-model="isPopupOpen"
      title=""
    >
      <div
        v-if="selectedTask !== null"
        class="flex flex-col items-center select-none"
      >
        <img
          class="object-contain h-28 mx-auto pointer-events-none"
          :src="icons[selectedTask.icon]"
        />

        <!-- Title -->
        <span class="text-xl font-bold text-yellow-300 pb-1 mt-1 mb-4">
          {{ selectedTask.title }}
        </span>

        <!-- Join -->
        <button
          v-if="selectedTask.url !== undefined"
          class="flex items-center justify-center text-white rounded-xl text-center px-8 py-1 mb-4
            bg-[#002AFF] hover:bg-blue-700 ring-1 ring-blue-500 disabled:bg-blue-900/50 disabled:hover:bg-blue-900/50"
          :disabled="isLoading"
          @click="openLink(selectedTask.url)"
        >
          <span class="my-1 font-extrabold text-lg">
            Join
          </span>
        </button>

        <!-- Profit -->
        <div class="flex justify-center items-center gap-2 mb-4">
          <img
            class="object-contain h-10 pointer-events-none"
            src="~/assets/img/icons/coin.png"
          />

          <span class="text-2xl font-bold">
            +{{ selectedTask.reward.toLocaleString("en-US") }}
          </span>
        </div>

        <!-- Button -->
        <button
          class="flex items-center justify-center w-full text-white rounded-full text-center
            bg-[#002AFF] hover:bg-blue-700 ring-1 ring-blue-500 disabled:bg-blue-900/50 disabled:hover:bg-blue-900/50"
          :disabled="selectedTask.completed || isLoading"
          @click="checkTask"
        >
          <span class="flex items-center justify-center gap-2 my-2 font-extrabold text-xl h-10">
            <template v-if="isLoading">
              <Icon
                name="bx:loader-alt"
                class="animate-spin h-8 w-8 mt-1"
              />
              Processing...
            </template>
            <template v-else-if="selectedTask.completed">
              Completed
            </template>

            <template v-else>
              Check
            </template>
          </span>
        </button>
      </div>

      <div v-else>
        Select a task to see more details
      </div>
    </AppPopup>

    <!-- Header -->
    <div class="flex flex-col select-none mt-2">
      <img
        class="object-contain h-24 mx-auto pointer-events-none"
        src="~/assets/img/icons/coin.png"
        style="filter: drop-shadow(0 0 20px rgba(250, 255, 0, 0.7));"
      />

      <span class="text-3xl font-extrabold text-center mt-2 pb-1">
        Earn More Coins
      </span>
    </div>

    <!-- Task List -->
    <h2 class="text-white text-lg font-bold mb-1">
      Tasks List
    </h2>

    <div class="overflow-y-scroll grow flex-shrink basis-0 p-2">
      <button
        v-for="task in tasks"
        :key="task.title"
        class="flex items-center justify-start border-b-2 bg-[#0b30ed] border-black/50 rounded-full px-2 py-1 mb-2 relative w-full"
        @click="openPopup(task)"
      >
        <div class="flex items-center justify-center w-12 h-12 absolute -left-1 overflow-hidden">
          <img
            :src="icons[task.icon]"
            :alt="task.icon"
            class="object-contain w-12 h-12 pointer-events-none"
          />
        </div>

        <div class="ml-12 flex flex-col items-start grow">
          <span class="text-md text-white font-bold">
            {{ task.title }}
          </span>
          <span class="text-sm text-white font-bold">
            + {{ task.reward.toLocaleString("en-US") }}
          </span>
        </div>

        <div
          v-if="task.completed"
          class="flex items-center justify-center mr-2 p-0.5 bg-slate-900/60 rounded-full"
        >
          <Icon
            name="mdi:check"
            class="w-6 h-6 text-white"
          />
        </div>
      </button>

      <div class="h-20" />
    </div>
  </section>
</template>

<style>

</style>
