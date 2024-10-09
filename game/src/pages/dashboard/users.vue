<script lang="ts" setup>
import { toast } from "vue3-toastify";
import type { UserRole } from "~/types";
import { UserDto, UserLevelDto } from "~/types/dto/user";

interface UsersData {
    users: UserDto[];
    total: number;
    offset: number;
    limit: number;
}

interface TransformedUsersData {
    users: { user: UserDto; selected: boolean }[];
    total: number;
    offset: number;
    limit: number;
}

definePageMeta({
    layout: "dashboard",
});

const isLoading = ref<boolean>(false);
const pageSize: number = 30;

function newTempUserDto(): UserDto {
    const instance = new UserDto();
    instance.level = new UserLevelDto();

    return instance;
}

function transformFn(usersData: UsersData): TransformedUsersData {
    return {
        users: usersData.users.map((user) => {
            return {
                user: user,
                selected: false,
            };
        }),
        total: usersData.total,
        offset: usersData.offset,
        limit: usersData.limit,
    };
}

const { data: usersData, error } = await useFetch(`/api/dashboard/users?search=&offset=0&limit=${pageSize}`, {
    transform: transformFn,
});
if (error.value) {
    toast.error("Failed to fetch users: " + getErrorMsg(error.value));
}

const currentPage = ref<number>(1);
const pageCount = computed<number>(() => {
    return Math.ceil(usersData.value!.total / pageSize);
});

async function fetchUsers(search: string | null, role: string | null, orderBy: string, page: number): Promise<void> {
    if (page < 1) {
        toast.error("Page must be greater than or equal to 1");
        return;
    }

    page -= 1;
    search = search ?? "";

    isLoading.value = true;
    try {
        const url: string = "/api/dashboard/users?"
            + `search=${encodeURIComponent(search)}`
            + `&role=${role ?? ""}`
            + `&orderBy=${searchOrder.value}&orderDirection=DESC`
            + `&offset=${page * pageSize}&limit=${pageSize}`;
        usersData.value = transformFn(await $fetch(url));
    } catch (error) {
        toast.error("Failed to fetch users: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

const searchInput = ref<HTMLInputElement | null>(null);
const lastSearch = ref<string>("");
const lastSearchRole = ref<string>("");
const lastSearchOrder = ref<string>("");
const searchWords = ref<string>("");
const searchRole = ref<string>("");
const searchOrder = ref<string>("id");
const searchDebounce = useDebounceFn(async () => {
    if (searchWords.value.trim() === lastSearch.value
        && searchRole.value.trim() === lastSearchRole.value
        && searchOrder.value === lastSearchOrder.value) {
        return;
    }

    lastSearch.value = searchWords.value.trim();
    lastSearchRole.value = searchRole.value.trim();
    await fetchUsers(searchWords.value, searchRole.value, searchOrder.value, 1);
    currentPage.value = 1;
    searchInput.value?.focus();
}, 1000);

async function refreshUsers(): Promise<void> {
    lastSearch.value = "";
    lastSearchRole.value = "";
    searchWords.value = "";
    searchRole.value = "";
    searchOrder.value = "id";
    await fetchUsers(null, null, searchOrder.value, 1);
    currentPage.value = 1;
}

// Modal
const isModalOpen = ref<boolean>(false);
const selectedUser = ref<UserDto>(newTempUserDto());
const isBanModalOpen = ref<boolean>(false);
const isBanSelectedUsersModal = ref<boolean>(false);

function openEditModal(user: UserDto): void {
    selectedUser.value = user;
    isModalOpen.value = true;
    isBanModalOpen.value = false;
    isBanSelectedUsersModal.value = false;
}

function openBanModal(user: UserDto): void {
    selectedUser.value = user;
    isModalOpen.value = false;
    isBanModalOpen.value = true;
    isBanSelectedUsersModal.value = false;
}

function openDeleteSelectedModal(): void {
    if (usersData.value?.users.filter(user => user.selected).length === 0) {
        return;
    }

    isModalOpen.value = false;
    isBanModalOpen.value = false;
    isBanSelectedUsersModal.value = true;
}

async function editUser(): Promise<void> {
    isLoading.value = true;

    try {
        await $fetch("/api/dashboard/user", {
            method: "PUT",
            body: {
                ...selectedUser.value,
            },
        });

        toast.success("User saved", { autoClose: 1000 });
        isModalOpen.value = false;
    } catch (error) {
        toast.error("Failed to edit User: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

async function banUsers(ids: number[]): Promise<void> {
    if (ids.length === 0) {
        return;
    }

    isLoading.value = true;

    try {
        await $fetch("/api/dashboard/user", {
            method: "DELETE",
            body: ids,
        });

        toast.success("User banned", { autoClose: 1000 });
        isBanModalOpen.value = false;
        isBanSelectedUsersModal.value = false;
    } catch (error) {
        toast.error("Failed to ban User: " + getErrorMsg(error));
    }

    isLoading.value = false;
}

function banUser(userId: number): Promise<void> {
    return banUsers([userId]);
}

function banSelectedUsers(): Promise<void> {
    return banUsers(usersData.value?.users.filter(user => user.selected).map(user => user.user.id) ?? []);
}

// Table
function selectAllUsers(checked: boolean): void {
    for (const user of usersData.value!.users) {
        user.selected = checked;
    }
}

function getUserRoleCssClass(role: UserRole): string {
    // There is a bug if use roles from the enum
    switch (role) {
        case "admin":
        case "moderator":
            return "bg-error/10 text-error";
        case "support":
            return "bg-warning/10 text-warning";
        case "user":
        default:
            return "bg-info/10 text-info";
    }
}
</script>

<template>
  <div
    v-if="usersData !== null"
    class="flex flex-col grow drawer-content"
  >
    <h3 class="text-lg font-bold">
      User
    </h3>

    <div class="card card-bordered grow mt-5 bg-base-100">
      <div class="card-body p-0">
        <!-- Table Header -->
        <div class="flex items-center justify-between px-5 pt-5">
          <div class="inline-flex items-center gap-3 grow">
            <div class="form-control flex flex-row items-center rounded-box border border-base-content/20 px-3 max-w-xs">
              <Icon
                name="mdi:magnify"
                size="16"
              />

              <input
                ref="searchInput"
                v-model="searchWords"
                :disabled="isLoading"
                name="search"
                placeholder="Search users"
                class="input w-full focus:border-transparent focus:outline-0 transition-all input-sm focus:outline-offset-0"
                @keyup="searchDebounce"
                @keypress="searchDebounce"
              />
            </div>

            <select
              v-model="searchRole"
              :disabled="isLoading"
              class="select select-bordered select-sm max-w-xs"
              @change="searchDebounce"
            >
              <option value="">
                Role
              </option>
              <option value="admin">
                Admin
              </option>
              <option value="moderator">
                Moderator
              </option>
              <option value="support">
                Support
              </option>
              <option value="user">
                User
              </option>
            </select>

            <div class="flex items-center gap-2">
              <span class="label-text">Sort by</span>
              <select
                v-model="searchOrder"
                :disabled="isLoading"
                class="select select-bordered select-sm max-w-xs"
                @change="searchDebounce"
              >
                <option value="id">
                  ID
                </option>
                <option value="level">
                  Level
                </option>
                <option value="balance">
                  Balance
                </option>
                <option value="profit">
                  Profit
                </option>
                <option value="referrals">
                  Referrals
                </option>
                <option value="created_at">
                  Created At
                </option>
              </select>
            </div>
          </div>

          <div class="inline-flex items-center gap-3">
            <button
              class="btn flex btn-sm btn-success"
              :disabled="isLoading"
              @click="refreshUsers"
            >
              <Icon
                name="ic:baseline-refresh"
                size="16"
              />
              <span>Refresh</span>
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
              <span>Ban</span>
            </button>
          </div>
        </div>

        <!-- Table -->
        <DashboardTable
          :columns="['TelegramId', 'Name', 'Role', 'Level', 'Banned', 'Balance', 'Profit', 'Referrals', 'Created At', 'Action']"
          :selectable="true"
          @all-selected="selectAllUsers"
        >
          <tr
            v-for="userInfo in usersData.users"
            :key="userInfo.user.id"
            class="cursor-pointer hover:bg-base-200/40"
          >
            <th>
              <input
                v-model="userInfo.selected"
                type="checkbox"
                class="checkbox checkbox-xs"
              />
            </th>

            <!-- TelegramId -->
            <td>
              <div class="font-medium">
                {{ userInfo.user.telegramId }}
              </div>
            </td>

            <!-- Name -->
            <td>
              <div class="flex items-center space-x-3 truncate">
                <div class="font-medium">
                  {{ userInfo.user.username ?? userInfo.user.firstName + (userInfo.user.lastName ? " " + userInfo.user.lastName : "") }}
                </div>
              </div>
            </td>

            <!-- Role -->
            <td>
              <div class="flex items-center gap-2">
                <div
                  aria-label="Badge"
                  class="badge border-0 font-medium capitalize"
                  :class="getUserRoleCssClass(userInfo.user.role)"
                >
                  {{ userInfo.user.role }}
                </div>
              </div>
            </td>

            <!-- Level -->
            <td>
              <div class="font-medium">
                {{ userInfo.user.level.level }}
              </div>
            </td>

            <!-- Banned -->
            <td>
              <div class="flex items-center gap-2">
                <div
                  aria-label="Badge"
                  class="badge border-0 font-medium capitalize"
                  :class="[
                    userInfo.user.isBanned ? 'bg-error/10 text-error' : 'bg-success/10 text-success',
                  ]"
                >
                  {{ userInfo.user.isBanned ? "Yes" : "No" }}
                </div>
              </div>
            </td>

            <!-- Balance -->
            <td>
              <div class="text-sm font-medium">
                {{ userInfo.user.balance.toLocaleString("en-US") }}
              </div>
            </td>

            <!-- Profit -->
            <td>
              <div class="text-sm font-medium">
                {{ userInfo.user.profitPerHour.toLocaleString("en-US") }}
              </div>
            </td>

            <!-- Referrals -->
            <td>
              <div class="text-sm font-medium">
                {{ userInfo.user.referrals.toLocaleString("en-US") }}
              </div>
            </td>

            <!-- Created At -->
            <td>
              <div class="text-sm">
                {{ new Date(userInfo.user.createdAt).toDateString() }}
              </div>
            </td>

            <!-- Action -->
            <td>
              <div class="inline-flex w-fit">
                <button
                  class="btn btn-sm btn-square btn-ghost"
                  :disabled="isLoading"
                  @click="openEditModal(userInfo.user)"
                >
                  <Icon
                    class="text-base-content/70"
                    name="mdi:pencil-outline"
                    size="20"
                  />
                </button>

                <button
                  class="btn text-error/70 hover:bg-error/20 btn-sm btn-square btn-ghost"
                  :disabled="isLoading"
                  @click="openBanModal(userInfo.user)"
                >
                  <Icon
                    name="bi:ban"
                    size="20"
                  />
                </button>
              </div>
            </td>
          </tr>
        </DashboardTable>

        <!-- Table Footer -->
        <div class="flex items-center justify-between px-5 pb-2">
          <div class="inline-flex items-center gap-3" />

          <div class="inline-flex items-center gap-3">
            <!-- Pagination -->
            <DashboardPagination
              v-model="currentPage"
              :total-pages="pageCount"
              :disabled="isLoading"
              @page-changed="(page: number) => fetchUsers(searchWords, searchRole, searchOrder, page)"
            />
          </div>
        </div>
      </div>
    </div>

    <DashboardModal v-model="isModalOpen">
      <h2 class="card-title text-lg font-bold mb-4">
        {{ selectedUser.balance !== undefined ? "Edit User" : "New User" }}
      </h2>

      <form @submit.prevent="editUser">
        <!-- Telegram ID -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="telegramId"
          >
            <span class="label-text">Telegram ID</span>
          </label>
          <input
            id="telegramId"
            v-model="selectedUser.telegramId"
            type="number"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- First Name -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="firstName"
          >
            <span class="label-text">First Name</span>
          </label>
          <input
            id="firstName"
            v-model="selectedUser.firstName"
            type="text"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Last Name -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="lastName"
          >
            <span class="label-text">Last Name</span>
          </label>
          <input
            id="lastName"
            v-model="selectedUser.lastName"
            type="text"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Username -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="username"
          >
            <span class="label-text">Username</span>
          </label>
          <input
            id="username"
            v-model="selectedUser.username"
            type="text"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Created At -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="createdAt"
          >
            <span class="label-text">Created At</span>
          </label>
          <input
            id="createdAt"
            v-model="selectedUser.createdAt"
            type="text"
            class="input input-bordered"
            disabled
          />
        </div>

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
            v-model="selectedUser.level.level"
            type="text"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Balance per Click -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="balancePerClick"
          >
            <span class="label-text">Balance per Click</span>
          </label>
          <input
            id="balancePerClick"
            v-model="selectedUser.balancePerClick"
            type="number"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Total Clicks -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="totalClicks"
          >
            <span class="label-text">Total Clicks</span>
          </label>
          <input
            id="totalClicks"
            v-model="selectedUser.totalClicks"
            type="number"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Profit per Hour -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="profitPerHour"
          >
            <span class="label-text">Profit per Hour</span>
          </label>
          <input
            id="profitPerHour"
            v-model="selectedUser.profitPerHour"
            type="number"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Total Referral Rewards -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="totalReferralRewards"
          >
            <span class="label-text">Total Referral Rewards</span>
          </label>
          <input
            id="totalReferralRewards"
            v-model="selectedUser.totalReferralRewards"
            type="number"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Referrals -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="referrals"
          >
            <span class="label-text">Referrals</span>
          </label>
          <input
            id="referrals"
            v-model="selectedUser.referrals"
            type="number"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Energy Limit -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="energyLimit"
          >
            <span class="label-text">Energy Limit</span>
          </label>
          <input
            id="energyLimit"
            v-model="selectedUser.energyLimit"
            type="number"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Last Login Reward Day -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="lastLoginRewardDay"
          >
            <span class="label-text">Last Login Reward Day</span>
          </label>
          <input
            id="lastLoginRewardDay"
            v-model="selectedUser.lastLoginRewardDay"
            type="number"
            class="input input-bordered"
            disabled
          />
        </div>

        <!-- Editable Fields -->

        <!-- Is Banned -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="isBanned"
          >
            <span class="label-text">Is Banned</span>
            <input
              id="isBanned"
              v-model="selectedUser.isBanned"
              type="checkbox"
              class="toggle toggle-error"
            />
          </label>
        </div>

        <!-- Role -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="role"
          >
            <span class="label-text">Role</span>
          </label>
          <select
            id="role"
            v-model="selectedUser.role"
            class="input input-bordered"
          >
            <option value="admin">
              Admin
            </option>
            <option value="moderator">
              Moderator
            </option>
            <option value="support">
              Support
            </option>
            <option value="user">
              User
            </option>
          </select>
        </div>

        <!-- Photo URL -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="photoUrl"
          >
            <span class="label-text">Photo URL</span>
          </label>
          <input
            id="photoUrl"
            v-model="selectedUser.photoUrl"
            type="url"
            class="input input-bordered"
          />
        </div>

        <!-- Selected Character Rank -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="selectedCharacterRank"
          >
            <span class="label-text">Selected Character Rank</span>
          </label>
          <input
            id="selectedCharacterRank"
            v-model="selectedUser.selectedCharacterRank"
            type="number"
            class="input input-bordered"
          />
        </div>

        <!-- Balance -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="balance"
          >
            <span class="label-text">Balance</span>
          </label>
          <input
            id="balance"
            v-model="selectedUser.balance"
            type="number"
            class="input input-bordered"
          />
        </div>

        <!-- Energy -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="energy"
          >
            <span class="label-text">Energy</span>
          </label>
          <input
            id="energy"
            v-model="selectedUser.energy"
            type="number"
            class="input input-bordered"
          />
        </div>

        <!-- Daily Energy Replenishment Used -->
        <div class="form-control mb-4">
          <label
            class="label"
            for="dailyEnergyReplenishmentUsed"
          >
            <span class="label-text">Daily Energy Replenishment Used</span>
          </label>
          <input
            id="dailyEnergyReplenishmentUsed"
            v-model="selectedUser.dailyEnergyReplenishmentUsed"
            type="number"
            class="input input-bordered"
          />
        </div>

        <!-- Submit Button -->
        <div class="form-control mb-4">
          <button
            type="submit"
            class="btn btn-primary"
          >
            Save
          </button>
        </div>
      </form>
    </DashboardModal>

    <!-- Ban Confirm Modal -->
    <DashboardConfirmModal
      v-model="isBanModalOpen"
      :title="'Ban ' + selectedUser.telegramId + '?'"
      sub-title="Are you sure you want to ban this user."
      sub-title-class="text-error"
      button-text="Confirm"
      button-class="btn-error"
      @confirm="banUser(selectedUser.id)"
    />

    <!-- Ban Selected Confirm Modal -->
    <DashboardConfirmModal
      v-model="isBanSelectedUsersModal"
      title="Ban selected users?"
      sub-title="Are you sure you want to ban this users."
      sub-title-class="text-error"
      button-text="Confirm"
      button-class="btn-error"
      @confirm="banSelectedUsers"
    />
  </div>
</template>

<style>

</style>
