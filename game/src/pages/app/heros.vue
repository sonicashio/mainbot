<script lang="ts" setup>
import { toast } from "vue3-toastify";
import type { UserCharacterDto } from "~/types/dto/user";

definePageMeta({
    layout: "app-logged-in",
});

const isLoading = ref<boolean>(false);
const isPopupOpen = ref<boolean>(false);
const { user, sync } = useUser();

const { data: heros, error } = await useFetch("/api/character/list", {
    transform: (data: UserCharacterDto[]) => {
        return data.sort((a, b) => a.rank - b.rank);
    },
});

if (error.value) {
    toast.error("Failed to fetch heros: " + getErrorMsg(error.value));
}

const userSelectedHero = ref<UserCharacterDto>(heros.value!.find(hero => hero.selected)!);
const heroSelected = ref<UserCharacterDto>(userSelectedHero.value);
const nextLevel = computed<{ level: number; price: number; profit: number } | undefined>(() => {
    return heroSelected.value.levels.find(
        level => level.level === heroSelected.value.currentLevel + 1,
    );
});

async function levelUp(): Promise<void> {
    if (user.value === null) {
        return;
    }

    if (nextLevel.value === undefined) {
        return;
    }

    if (user.value.balance < nextLevel.value.price) {
        toast.error("Not enough balance");
        return;
    }

    isLoading.value = true;
    try {
        const hereRank: number = heroSelected.value.rank;
        const response = await $fetch("/api/user/user-chracter/levelup", {
            method: "POST",
            body: {
                rank: hereRank,
            },
        });
        isPopupOpen.value = false;

        toast.success("Level up success", { autoClose: 1000 });
        heros.value!.find(hero => hero.rank === hereRank)!.currentLevel = response.newLevel;
        await sync(0);
    } catch (error) {
        toast.error("Failed to level up: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

async function selectCharacter(): Promise<void> {
    if (user.value === null) {
        return;
    }

    isLoading.value = true;
    try {
        const hereRank: number = heroSelected.value.rank;
        await $fetch("/api/user/user-chracter/select", {
            method: "POST",
            body: {
                rank: hereRank,
            },
        });

        const hero: UserCharacterDto = heros.value!.find(hero => hero.rank === hereRank)!;
        userSelectedHero.value = hero;

        await sync(0);
    } catch (error) {
        toast.error("Failed to select: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

async function unlockCharacter(): Promise<void> {
    if (user.value === null) {
        return;
    }

    if (user.value.balance < heroSelected.value.price) {
        toast.error("Not enough balance");
        return;
    }

    isLoading.value = true;
    try {
        const heroRank: number = heroSelected.value.rank;
        await $fetch("/api/user/user-chracter/unlock", {
            method: "POST",
            body: {
                rank: heroRank,
            },
        });
        isPopupOpen.value = false;

        const hero: UserCharacterDto = heros.value!.find(hero => hero.rank === heroRank)!;
        hero.unlocked = true;
        userSelectedHero.value = hero;

        await sync(0);
    } catch (error) {
        toast.error("Failed to unlock: " + getErrorMsg(error));
    }

    isLoading.value = false;
}
</script>

<template>
  <section class="flex flex-col grow mx-2">
    <!-- Popup -->
    <AppPopup
      v-model="isPopupOpen"
      title=""
    >
      <div class="flex flex-col items-center select-none">
        <img
          class="object-contain h-40 mx-auto pointer-events-none"
          :src="`/img/characters/${heroSelected.rank}.png`"
        />
        <span class="text-xl font-bold text-yellow-300 pb-1">{{ heroSelected.name }}</span>

        <!-- Level -->
        <span class="flex items-center justify-center text-md font-bold">
          <template v-if="!heroSelected.unlocked">
            Unlock Price
          </template>

          <template v-else-if="heroSelected.currentLevel !== heroSelected.maxLevel">
            Level {{ heroSelected.currentLevel }}
            <Icon
              name="bx:chevron-right"
              size="24"
            />
            {{ heroSelected.currentLevel + 1 }}
          </template>

          <template v-else>
            No More Levels
          </template>
        </span>

        <!-- Profit -->
        <template v-if="heroSelected.unlocked && nextLevel !== undefined">
          <span class="text-md py-1">Profit per hour</span>
          <div class="flex justify-center items-center gap-1">
            <img
              class="object-contain h-6 pointer-events-none"
              src="~/assets/img/icons/coin.png"
            />

            <span class="text-lg font-bold">
              +{{ nextLevel.profit.toLocaleString("en-US") }}
            </span>
          </div>
        </template>

        <template v-else-if="heroSelected.unlocked && nextLevel === undefined">
          <span class="text-md py-1">Max Level</span>
        </template>

        <template v-else>
          <span class="text-md">Coins per click</span>
          <div class="flex justify-center items-center gap-1">
            <img
              class="object-contain h-6 pointer-events-none"
              src="~/assets/img/icons/tap.png"
            />

            <span class="text-lg font-bold">
              +1
            </span>
          </div>

          <span class="text-md">Energy Limit</span>
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
          v-if="heroSelected.currentLevel !== heroSelected.maxLevel"
          class="flex justify-center items-center gap-4 mt-4 mb-3"
        >
          <img
            class="object-contain h-10 pointer-events-none"
            src="~/assets/img/icons/coin.png"
          />

          <span class="text-3xl font-bold">
            <template v-if="heroSelected.unlocked && nextLevel !== undefined">
              {{ nextLevel.price.toLocaleString("en-US") }}
            </template>
            <template v-else-if="heroSelected.unlocked && nextLevel === undefined">
              Max Level
            </template>
            <template v-else>
              {{ heroSelected.price.toLocaleString("en-US") }}
            </template>
          </span>
        </div>

        <!-- Button -->
        <button
          v-if="heroSelected.currentLevel !== heroSelected.maxLevel"
          class="flex items-center justify-center w-full text-white rounded-full text-center
            bg-[#002AFF] hover:bg-blue-700 ring-1 ring-blue-500 disabled:bg-blue-900/50 disabled:hover:bg-blue-900/50"
          :disabled="isLoading"
          @click="heroSelected.unlocked ? levelUp() : unlockCharacter()"
        >
          <span class="flex items-center justify-center gap-2 my-2 font-extrabold text-xl h-10">
            <template v-if="isLoading">
              <Icon
                name="bx:loader-alt"
                class="animate-spin h-8 w-8 mt-1"
              />
              Processing...
            </template>
            <template v-else-if="heroSelected.unlocked">
              Upgrade
            </template>
            <template v-else>
              Unlock
            </template>
          </span>
        </button>
      </div>
    </AppPopup>

    <!-- Hero & Actions -->
    <div class="flex items-stretch select-none">
      <!-- Hero -->
      <div class="flex flex-col items-center justify-center grow">
        <!-- Name -->
        <span class="text-xl font-bold text-yellow-300 pb-1">{{ heroSelected.name }}</span>

        <!-- Character -->
        <button @click="isPopupOpen = true">
          <img
            class="object-contain h-40 mx-auto pointer-events-none"
            :src="`/img/characters/${heroSelected.rank}.png`"
          />
        </button>

        <!-- Level -->
        <div class="flex flex-col justify-center items-center gap-1 w-full mt-0.5">
          <span class="flex items-center justify-center text-md font-bold">
            <template v-if="!heroSelected.unlocked">
              Unlock Price
            </template>

            <template v-else-if="heroSelected.currentLevel !== heroSelected.maxLevel">
              Level {{ heroSelected.currentLevel }}
              <Icon
                name="bx:chevron-right"
                size="24"
              />
              {{ heroSelected.currentLevel + 1 }}
            </template>

            <template v-else>
              No More Levels
            </template>
          </span>

          <!-- Price -->
          <div class="flex justify-center items-center gap-1">
            <img
              v-if="!heroSelected.unlocked || (heroSelected.unlocked && heroSelected.currentLevel !== heroSelected.maxLevel)"
              class="object-contain h-6 pointer-events-none"
              src="~/assets/img/icons/coin.png"
            />

            <div
              v-else
              class="h-6"
            />

            <span class="text-sm">
              <template v-if="!heroSelected.unlocked">
                {{ heroSelected.price.toLocaleString("en-US") }}
              </template>

              <template v-else-if="heroSelected.currentLevel !== heroSelected.maxLevel">
                {{ nextLevel?.price.toLocaleString("en-US") ?? "" }}
              </template>

              <template v-else>
                <span class="text-yellow-300">Max Level</span>
              </template>
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col justify-center border-l border-slate-700/40 pl-2 gap-2 min-w-28">
        <button
          class="text-white font-medium rounded-full text-sm px-5 py-2.5 text-center
            bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 disabled:hover:bg-blue-900/50"
          :disabled="heroSelected.name === userSelectedHero.name || !heroSelected.unlocked"
          @click="selectCharacter"
        >
          Select
        </button>

        <button
          class="text-white font-medium rounded-full text-sm px-5 py-2.5 text-center
            bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 disabled:hover:bg-blue-900/50"
          :disabled="heroSelected.currentLevel === heroSelected.maxLevel"
          @click="isPopupOpen = true"
        >
          <template v-if="heroSelected.unlocked">
            Upgrade
          </template>

          <template v-else>
            <span class="font-bold">Unlock</span>
          </template>
        </button>
      </div>
    </div>

    <!-- Divider -->
    <div class="flex w-full items-center rounded-full my-2">
      <div class="flex-1 border-b border-slate-700/40" />
    </div>

    <!-- Heros -->
    <div class="overflow-y-scroll grow flex-shrink basis-0">
      <div class="grid grid-cols-2 gap-2 place-items-stretch m-1 select-none pr-1">
        <button
          v-for="hero in heros"
          :key="hero.name"
          class="flex flex-col items-center justify-center rounded-3xl border-b-2 bg-[#0b30ed] border-black/50"
          :class="[
            heroSelected.name === hero.name ? 'ring-2 ring-white' : '',
            hero.unlocked ? 'opacity-100' : 'opacity-70',
          ]"
          @click="heroSelected = hero"
        >
          <div class="flex items-center">
            <span
              class="text-md font-bold mt-0.5"
              :class="[
                userSelectedHero === hero ? 'text-yellow-300' : 'text-white',
              ]"
            >
              {{ hero.name }}
            </span>
            <img
              v-if="!hero.unlocked"
              class="object-contain h-5 pointer-events-none"
              src="~/assets/img/icons/lock.png"
            />
          </div>
          <img
            class="object-contain h-28 pointer-events-none my-1"
            :src="`/img/characters/${hero.rank}.png`"
          />
        </button>

        <div class="h-20" />
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
