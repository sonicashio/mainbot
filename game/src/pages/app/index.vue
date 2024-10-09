<script lang="ts" setup>
definePageMeta({
    layout: "app-logged-in",
});

// Back button
const { useWebAppBackButton } = await import("vue-tg");
const { onBackButtonClicked } = useWebAppBackButton();

await callOnce(() => {
    onBackButtonClicked(() => {
        const { isPopupOpen, closePopup } = useAppPopup();
        if (isPopupOpen.value) {
            closePopup();
            return;
        }

        navigateTo("/app");
    }, { manual: true });
});

// User
const { user, profitSinceLastSync, sync } = useUser();
const showOfflineProfit = useState<boolean>("showOfflineProfit", () => profitSinceLastSync.value > 100);

const friendlyProfit = computed<string>(() => {
    if (!user.value) {
        return "0";
    }

    return numberFriendlyName(user.value.profitPerHour) ?? "0";
});
const friendlyTaps = computed<string>(() => {
    if (!user.value) {
        return "0";
    }

    return numberFriendlyName(user.value.balancePerClick) ?? "0";
});
const friendlyCoins = computed<string>(() => {
    if (!user.value) {
        return "0";
    }

    return user.value.balance.toLocaleString("en-US");
});

// Dynamic values
const clicks = useState<number>("clicks", () => 0);
const energyReplenishmentRate = ref<number>(user.value!.energyLimit / 3600);
const profitPerSecondRate = ref<number>(user.value!.profitPerHour / 3600);
const lastEnergyModifiedTime = ref<number>(Date.now());
const lastCoinModifiedTime = ref<number>(Date.now());

function calculateNumberToAdd(lastModifiedTime: number, ratePerSecond: number): number {
    const now: number = Date.now();
    const secondsElapsed: number = (now - lastModifiedTime) / 1000;
    if (secondsElapsed <= 1) {
        return 0;
    }

    return Math.floor(secondsElapsed * ratePerSecond);
}

function updateDynamicValues(): void {
    if (user.value === null) {
        return;
    }

    const energyToAdd: number = calculateNumberToAdd(lastEnergyModifiedTime.value, energyReplenishmentRate.value);
    if (energyToAdd > 0) {
        lastEnergyModifiedTime.value = Date.now();
        user.value.energy = Math.min(user.value.energy + energyToAdd, user.value.energyLimit);
    }

    const coinsToAdd: number = calculateNumberToAdd(lastCoinModifiedTime.value, profitPerSecondRate.value);
    if (coinsToAdd > 0) {
        lastCoinModifiedTime.value = Date.now();
        user.value.balance += coinsToAdd;
    }
}

// Debounced function to sync clicks with the server every 5 seconds
const syncClicks = useDebounceFn(async () => {
    if (user.value === null || clicks.value <= 0) {
        return;
    }

    const clicksToSend: number = clicks.value;

    if (await sync(clicksToSend)) {
        clicks.value -= clicksToSend;

        energyReplenishmentRate.value = user.value.energyLimit / 3600;
        profitPerSecondRate.value = user.value.profitPerHour / 3600;
    }
}, 5000, { maxWait: 5000 });

// Handle multi-clicks using pointerdown
function multiClickHandler(): void {
    if (user.value === null || user.value.energy <= 0) {
        return;
    }

    clicks.value++;
    user.value.balance += user.value.balancePerClick;
    user.value.energy--;
    syncClicks();
}

useIntervalFn(() => {
    updateDynamicValues();
}, 1000);

const floatingTexts = ref<{ content: string; x: number; y: number; id: number }[]>([]);
const clicker = ref<HTMLDivElement | null>(null);

function createFloatingText(event: MouseEvent): void {
    if (user.value === null) {
        return;
    }

    if (user.value.energy <= 0) {
        return;
    }

    const card = clicker.value as HTMLDivElement;
    const rect = card.getBoundingClientRect();
    const x: number = event.clientX - rect.left - rect.width / 2;
    const y: number = event.clientY - rect.top - rect.height / 2;

    card.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg)`;
    setTimeout(() => {
        card.style.transform = "";
    }, 100);

    const text = {
        content: "+" + (user.value?.balancePerClick.toString() ?? "0"),
        x: event.pageX,
        y: event.pageY,
        id: Date.now(),
    };
    floatingTexts.value.push(text);

    setTimeout(() => {
        const index: number = floatingTexts.value.findIndex(t => t.id === text.id);
        if (index !== -1) {
            floatingTexts.value.splice(index, 1);
        }
    }, 1000);
}

onMounted(() => {
    onClickOutside(document.body, () => {
        floatingTexts.value = [];
    });
});
</script>

<template>
  <section
    v-if="user !== null"
    class="flex flex-col flex-1 mx-2"
  >
    <!-- Offline Profit -->
    <AppPopup
      v-model="showOfflineProfit"
      title=""
    >
      <div class="flex flex-col items-center justify-center text-white font-bold mt-1">
        <img
          class="object-contain w-20 h-20 pointer-events-none"
          src="~/assets/img/icons/coin.png"
          style="filter: drop-shadow(0 0 10px rgba(255, 255, 0, 1));"
        />

        <span class="mt-4 text-center text-white text-xl font-bold select-none">
          Profit earned since your last login
        </span>

        <div class="flex flex-col items-center justify-center gap-4 mt-1 w-full m-1 select-none">
          <span class="text-3xl font-extrabold text-yellow-300 mb-1">
            + {{ profitSinceLastSync.toLocaleString("en-US") }}
          </span>

          <button
            class="flex items-center justify-center w-full text-white rounded-full text-center
            bg-[#002AFF] hover:bg-blue-700 ring-1 ring-blue-500 disabled:bg-blue-900/50 disabled:hover:bg-blue-900/50"
            @click="showOfflineProfit = false"
          >
            <span class="flex items-center justify-center gap-2 my-2 font-extrabold text-xl h-10">
              Thank You
            </span>
          </button>
        </div>
      </div>
    </AppPopup>

    <AppMainMenu class="mt-1" />

    <!-- Profit & Income -->
    <div class="flex justify-center gap-10 mt-2 select-none">
      <div class="flex gap-1.5 place-items-center">
        <img
          class="object-contain h-6 w-6 pointer-events-none"
          src="~/assets/img/icons/coin.png"
        />
        <p class="text-lg tracking-wider font-extrabold">
          {{ friendlyProfit }}
        </p>
        <div>
          <p class="text-xs text-slate-400">
            Profit / Hour
          </p>
        </div>
      </div>

      <div class="flex gap-1.5 place-items-center">
        <img
          class="object-contain h-6 w-6 pointer-events-none"
          src="~/assets/img/icons/tap.png"
        />
        <p class="text-lg tracking-wider font-extrabold">
          {{ friendlyTaps }}
        </p>
        <div>
          <p class="text-xs text-slate-400">
            Income / Tap
          </p>
        </div>
      </div>
    </div>

    <!-- Coins -->
    <div class="flex space-x-1.5 justify-center items-center select-none mt-2.5">
      <img
        class="object-contain w-12 h-12 pointer-events-none"
        src="~/assets/img/icons/coin.png"
      />
      <span class="text-3xl font-extrabold text-gradient">{{ friendlyCoins }}</span>
    </div>

    <!-- Clicker & Energy & Boost -->
    <div class="flex flex-col justify-between mt-3 flex-1">
      <!-- Clicker -->
      <button
        class="flex items-center justify-center px-4 grow select-none"
        @contextmenu.prevent
        @pointerdown.prevent="(event) => { createFloatingText(event); multiClickHandler(); }"
      >
        <div
          ref="clicker"
          class="w-80 h-80 p-4 rounded-full circle-outer"
        >
          <div
            class="w-full h-full rounded-full circle-inner"
            :disabled="user.energy <= 0"
          >
            <img
              :src="`/img/characters/${user.selectedCharacterRank}.png`"
              class="object-contain w-full h-full p-6 pointer-events-none"
              alt="Main Character"
            />
          </div>
        </div>
      </button>

      <!-- Floating coin messages -->
      <TransitionGroup
        name="float"
        tag="div"
      >
        <div
          v-for="text in floatingTexts"
          :key="text.id"
          class="floating-text"
          :style="{ left: `${text.x}px`, top: `${text.y}px` }"
        >
          {{ text.content }}
        </div>
      </TransitionGroup>

      <!-- Energy & Boost -->
      <div class="flex items-center justify-between mt-2 mb-4 select-none">
        <div class="flex items-center text-sm font-bold gap-1">
          <img
            class="object-contain w-8 h-8 pointer-events-none"
            src="~/assets/img/icons/charge.png"
            alt="coin"
          />

          <div class="flex items-center gap-1">
            <span class="text-lg font-normal">{{ user.energy ?? 0 }}</span>
            <span class="text-lg font-thin"> / </span>
            <span class="text-lg font-bold">{{ user.energyLimit ?? 0 }}</span>
          </div>
        </div>

        <NuxtLink
          class="flex items-center text-sm font-bold"
          to="/app/boost"
        >
          <img
            class="object-contain w-8 h-8 pointer-events-none"
            src="~/assets/img/icons/boost.png"
            alt="boost"
          />
          <span class="text-lg font-bold">Boost</span>
        </NuxtLink>
      </div>
    </div>

    <div class="h-20" />
  </section>

  <div v-else>
    Failed to load user. Please try again later.
  </div>
</template>

<style scoped>
.floating-text {
  position: absolute;
  pointer-events: none;
  animation: float-up 0.7s ease-out forwards;
  font-weight: bold;
  font-size: xx-large;
}

@keyframes float-up {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-90px);
  }
}

.float-enter-active {
  animation: float-up 0.7s ease-out forwards;
}

.float-leave-active {
  display: none;
}

.float-enter-from,
.float-leave-to {
  opacity: 0;
}

.circle-outer {
  background: linear-gradient(to bottom, #575def, #202731);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90vw;
  height: 90vw;
  max-width: 360px;
  max-height: 360px;
}

.circle-inner {
  background: radial-gradient(circle, #4960b2, #282e3e);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}
</style>
