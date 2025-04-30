<template>
  <router-view />
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/store/app";
import { supabase } from "@/supabase/config";

const router = useRouter();
const appStore = useAppStore();

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    user &&
    appStore.lastRoute &&
    appStore.lastRoute !== "/" &&
    window.location.pathname === "/"
  ) {
    router.push(appStore.lastRoute);
  }
});
</script>
