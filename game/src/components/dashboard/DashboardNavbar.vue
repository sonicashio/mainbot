<script lang="ts" setup>
import type { LocaleObject } from "@nuxtjs/i18n";
import { type MenuItem, isRouterMenuItem } from "~/types";

const props = defineProps<{ avatarItems: MenuItem[] }>();
const { user, logout } = useUser();

const route = useRoute();

// Locale
const i18n = useI18n();
const availableLocales: Ref<LocaleObject[]> = i18n.locales; // Comes from nuxt.config.ts
const locale: Ref<string> = await useLocale();
</script>

<template>
  <nav
    v-if="user !== null"
    class="navbar bg-base-100 shadow-md sticky top-0 z-10"
  >
    <!-- Left -->
    <div class="flex-1">
      <label
        for="app-drawer"
        class="btn btn-ghost drawer-button lg:hidden"
      >
        <Icon
          name="mdi:menu-close"
          size="32"
        />
      </label>
    </div>

    <!-- Right -->
    <div class="flex-none">
      <div class="dropdown dropdown-end">
        <div
          tabindex="0"
          role="button"
          class="btn btn-outline btn-ghost btn-circle"
        >
          {{ locale.toUpperCase() }}
        </div>

        <ul
          tabindex="0"
          class="menu dropdown-content bg-base-300 rounded-box z-[1] mt-3 w-52 p-2 shadow"
        >
          <li
            v-for="loc in availableLocales"
            :key="loc.code"
          >
            <a @click="locale = loc.code">
              {{ loc.name }}
            </a>
          </li>
        </ul>
      </div>

      <div class="dropdown dropdown-end">
        <div
          tabindex="0"
          role="button"
          class="btn btn-ghost btn-circle avatar"
        >
          <div class="w-10 rounded-full">
            <img
              alt="avatar"
              :src="user.photoUrl!"
            />
          </div>
        </div>

        <ul
          tabindex="0"
          class="menu dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
        >
          <li
            v-for="(item, index) in props.avatarItems"
            :key="index"
          >
            <div
              v-if="isRouterMenuItem(item)"
              :class="{ 'bg-base-200': route.path === item.route }"
              class="grid grid-flow-row gap-1"
            >
              <NuxtLink
                :to="item.route"
                class="col-span-4 flex place-items-center gap-2"
              >
                <Icon
                  v-if="item.icon"
                  :name="item.icon"
                  size="24"
                />
                <span class="font-semibold grow">{{ $t(item.localeName) }}</span>
                <div
                  v-if="item.badgeLocaleName"
                  class="badge badge-sm"
                >
                  {{ $t(item.badgeLocaleName) }}
                </div>
              </NuxtLink>

              <ul
                v-if="item.subItems"
                class="col-span-4 mt-2"
              >
                <li
                  v-for="(subItem, subIndex) in item.subItems"
                  :key="subIndex"
                >
                  <NuxtLink
                    :to="subItem.route"
                    class="w-full"
                  >
                    <span
                      v-if="route.path === subItem.route"
                      class="absolute inset-y-0 left-0 w-1 rounded-tr-md rounded-br-md bg-primary"
                    />
                    <Icon
                      v-if="subItem.icon"
                      :name="subItem.icon"
                      size="24"
                    />
                    <span class="font-semibold">{{ $t(subItem.localeName) }}</span>
                    <div
                      v-if="subItem.badgeLocaleName"
                      class="badge badge-sm"
                    >
                      {{ $t(subItem.badgeLocaleName) }}
                    </div>
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <div
              v-else
              class="menu-divider"
            >
              <div>{{ item.localeName ? $t(item.localeName) : "" }}</div>
            </div>
          </li>
          <li class="divider p-0 m-1 h-0.5" />
          <li><a @click="logout">Logout</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <div v-else>
    User not logged in
  </div>
</template>

<style></style>
