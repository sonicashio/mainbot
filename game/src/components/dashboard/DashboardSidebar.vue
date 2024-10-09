<script lang="ts" setup>
import { type MenuItem, isRouterMenuItem } from "~/types";

const props = defineProps<{ sideItems: MenuItem[] }>();
const route = useRoute();
</script>

<template>
  <ul class="menu bg-base-100 text-base-content h-full w-80">
    <li
      v-for="(item, index) in props.sideItems"
      :key="index"
    >
      <div
        v-if="isRouterMenuItem(item)"
        :class="{ 'bg-base-200': route.path === item.route }"
        class="grid grid-flow-row gap-1 p-0"
      >
        <NuxtLink
          :to="item.route"
          class="col-span-4 flex place-items-center gap-2 px-4 py-2"
        >
          <span
            v-if="route.path === item.route"
            class="absolute inset-y-0 left-0 w-1 rounded-tr-md rounded-br-md bg-primary"
          />
          <Icon
            v-if="item.icon"
            :name="item.icon"
            size="32"
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
  </ul>
</template>

<style>
.menu-divider {
    /*  */
    @apply flex w-full flex-col border-opacity-50 !cursor-default hover:bg-inherit active:bg-inherit focus:bg-inherit !important;
}

.menu-divider> :first-child {
    @apply divider p-0 m-1 h-0.5;
}
</style>
