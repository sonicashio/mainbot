<script lang="ts" setup>
import { toast } from "vue3-toastify";

definePageMeta({
    layout: "app-logged-in",
});

const telegramWebAppUrl: string = useSettings().settings.value!.telegramWebAppUrl;
const { user } = useUser();

const { data: referralData, error } = await useFetch("/api/user/referrals", {
    transform: (referralData) => {
        const referrals = referralData.referrals.map((referral) => {
            return {
                username: referral.username ?? referral.firstName + (referral.lastName ? " " + referral.lastName : ""),
                profitPerHour: referral.profitPerHour,
                photoUrl: referral.photoUrl,
                firstCharsName: firstCharsNameOfUserData(referral),
            };
        });
        return {
            referrals,
            referralReward: referralData.referralReward,
        };
    },
});
if (error.value) {
    toast.error("Failed to fetch referrals: " + getErrorMsg(error.value));
}

// Telegram
const { useWebAppNavigation } = await import("vue-tg");
const { openTelegramLink } = useWebAppNavigation();

function handleInviteFriend(): void {
    const inviteLink: string = `${telegramWebAppUrl}?startapp=${user.value!.telegramId}`;
    const shareText: string = `Join sonicash app`;
    const fullUrl: string = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`;
    openTelegramLink(fullUrl);
}

function handleCopyLink(): void {
    const inviteLink: string = `${telegramWebAppUrl}?startapp=${user.value!.telegramId}`;
    navigator.clipboard.writeText(inviteLink);
}
</script>

<template>
  <section
    v-if="user !== null && referralData !== null"
    class="flex flex-col grow mx-2"
  >
    <img
      class="object-contain h-32 pointer-events-none mt-4"
      src="~/assets/img/sonic-friends.png"
    />

    <!-- Invite your friend -->
    <div class="w-full bg-[#12069B] shadow-md border-2 border-black/60 rounded-2xl mt-4 px-6 py-2 select-none">
      <span class="text-lg font-bold text-white">Invite your friend</span>
      <div class="flex items-center gap-2">
        <img
          class="object-contain h-10 pointer-events-none"
          src="~/assets/img/icons/coin.png"
        />

        <span class="text-md font-extrabold bg-yellow-300 text-blue-800 rounded-full py-0.5 px-3 flex-shrink-0">
          +{{ referralData.referralReward.toLocaleString("en-US") }} P/H
        </span>

        <span class="text-md text-white font-light">
          For you and your friend
        </span>
      </div>

      <div class="flex justify-between gap-2">
        <button
          class="flex items-center justify-center grow text-white rounded-2xl text-center my-2 px-4 py-3
                  bg-[#002AFF] hover:bg-blue-700 ring-1 ring-blue-500 disabled:bg-blue-900/50 disabled:hover:bg-blue-900/50"
          @click="handleInviteFriend"
        >
          <span class="flex items-center justify-center grow gap-2 font-extrabold text-lg">
            Invite your friend
            <Icon
              name="mdi:user-plus"
              class="w-8 h-8"
            />
          </span>
        </button>

        <button
          class="flex items-center justify-center text-white rounded-2xl text-center my-2 px-4 py-3
                  bg-[#002AFF] hover:bg-blue-700 ring-1 ring-blue-500 disabled:bg-blue-900/50 disabled:hover:bg-blue-900/50"
          @click="handleCopyLink"
        >
          <Icon
            name="mdi:content-copy"
            class="w-6 h-6"
          />
        </button>
      </div>

      <div class="flex flex-col justify-between mb-1">
        <span class="text-lg font-bold text-white">Total referral rewards</span>
        <div class="flex items-center gap-2 mt-1">
          <img
            class="object-contain h-8 pointer-events-none"
            src="~/assets/img/icons/coin.png"
          />

          <span class="text-lg font-bold text-white">{{ user.totalReferralRewards.toLocaleString("en-US") }}</span>
        </div>
      </div>
    </div>

    <!-- Top friends -->
    <div class="flex flex-col select-none mt-6">
      <div class="flex items-center justify-between">
        <span class="text-lg font-bold text-white">Top friends</span>
        <div class="flex items-center gap-2">
          <span class="text-md font-light text-white">
            Invited
          </span>
          <span class="text-sm font-light text-white bg-[#12069B] shadow-md border-2 border-black/60 rounded-md py-0.5 px-2">
            {{ user.referrals }}
          </span>
        </div>
      </div>

      <!-- List -->
      <div
        class="bg-[#12069B] shadow-md border-2 border-black/60 rounded-2xl mt-4 mb-4 py-2 select-none"
        :class="[
          referralData.referrals.length == 0 ? 'text-center' : '',
        ]"
      >
        <ul
          v-if="referralData.referrals.length > 0"
          role="list"
          class="divide-y divide-blue-600/70"
        >
          <li
            v-for="referral in referralData.referrals"
            :key="referral.username"
            class="flex justify-between py-2 px-6"
          >
            <div class="flex items-center justify-center gap-x-4">
              <img
                v-if="referral.photoUrl"
                class="object-contain h-12 w-12 rounded-full bg-gray-50 pointer-events-none"
                :src="referral.photoUrl"
              />

              <span
                v-else
                class="flex items-center justify-center h-12 w-12 rounded-full text-black bg-gray-50"
              >
                {{ referral.firstCharsName }}
              </span>

              <div class="flex-auto">
                <p class="text-sm font-semibold leading-6">
                  {{ referral.username }}
                </p>
                <p class="truncate text-sm leading-5 text-gray-500">
                  Income per hour +<span class="font-bold">{{ referral.profitPerHour.toLocaleString("en-US") }}</span>
                </p>
              </div>
            </div>

            <div class="flex items-center">
              <!--  -->
            </div>
          </li>
        </ul>

        <span
          v-else
          class="text-md text-white font-bold select-none"
        >
          No referrals yet, invite your friends
        </span>
      </div>
    </div>

    <div class="h-20" />
  </section>

  <div v-else>
    User not logged in or no referrals data
  </div>
</template>

<style>
</style>
