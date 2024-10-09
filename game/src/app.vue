<script setup lang="ts">
// const i18nHead = useLocaleHead({
//     addDirAttribute: true,
//     identifierAttribute: "id",
//     addSeoAttributes: true,
// });

useHead({
    titleTemplate: "%s %separator Sonicash",
});
</script>

<template>
  <div class="bg-black">
    <!-- <Html
      :lang="i18nHead.htmlAttrs.lang"
      :dir="i18nHead.htmlAttrs.dir"
    /> -->
    <Body class="bg-black" />
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
