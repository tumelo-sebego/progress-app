<template>
  <router-view />
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/store/app";

const router = useRouter();
const appStore = useAppStore();

onMounted(() => {
  // Redirect to last known route if it exists
  if (appStore.lastRoute && appStore.lastRoute !== "/") {
    router.push(appStore.lastRoute);
  }
});
</script>
