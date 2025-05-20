<template>
  <router-view v-if="isReady" />
  <div v-else class="loading-container">
    <div class="loading-circle"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAppStore } from "@/store/app";
import { useGoalSettingsStore } from "@/store/goalSettings";

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const goalStore = useGoalSettingsStore();
const isReady = ref(false);
// const hasInitialized = ref(localStorage.getItem("hasInitialized") === "true");

async function determineInitialRoute() {
  try {
    // If already initialized and not at root
    if (appStore.hasInitialized && route.path !== "/") {
      // Validate current route against goal state
      const isValidRoute = await validateCurrentRoute();
      if (!isValidRoute) {
        // Route is invalid for current state, determine new route
        await determineRouteFromState();
        return;
      }
      isReady.value = true;
      return;
    }

    // Handle root path or initialization
    await determineRouteFromState();
  } catch (error) {
    console.error("Error determining initial route:", error);
    router.push("/login");
  } finally {
    isReady.value = true;
    appStore.hasInitialized = true;
    localStorage.setItem("hasInitialized", "true");
  }
}

// Add new function to validate current route
async function validateCurrentRoute() {
  await goalStore.initialize();
  const today = new Date();
  const currentGoal = goalStore.activeGoal;

  // If on home but no active goal, route is invalid
  if (route.path === "/home") {
    if (!currentGoal) return false;
    const startDate = new Date(currentGoal.start_date);
    const endDate = new Date(currentGoal.end_date);
    return startDate <= today && endDate > today;
  }

  // If on upcoming-goal but goal has started/expired, route is invalid
  if (route.path === "/upcoming-goal") {
    if (!currentGoal) return false;
    const startDate = new Date(currentGoal.start_date);
    return startDate > today;
  }

  return true;
}

// Extract route determination logic to a separate function
async function determineRouteFromState() {
  if (!appStore.isAuthenticated) {
    const isAuthenticated = await appStore.initializeAuth();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }

  await goalStore.initialize();
  const today = new Date();
  const activeGoal = goalStore.activeGoal;

  if (!activeGoal) {
    const latestGoal = await goalStore.getLatestGoal();
    if (!latestGoal) {
      router.push("/add-goal");
      return;
    }
    goalStore.setActiveGoal(latestGoal);
  }

  const startDate = new Date(goalStore.activeGoal.start_date);
  const endDate = new Date(goalStore.activeGoal.end_date);
  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);
  if (endDate < today) {
    router.push("/add-goal");
  } else if (startDate > today) {
    router.push("/upcoming-goal");
  } else {
    router.push("/home");
  }
}

// Handle visibility changes
// function handleVisibilityChange() {
//   if (!document.hidden && !hasInitialized.value) {
//     determineInitialRoute();
//   }
// }

onMounted(async () => {
  await determineInitialRoute();
  // Remove visibility change handler since auth state is now persistent
  // document.addEventListener("visibilitychange", handleVisibilityChange);
});

// Remove onBeforeUnmount since we're not using visibility handler anymore
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #232323;
  z-index: 9999;
}

.loading-circle {
  width: 50px;
  height: 50px;
  border: 4px solid #50a65d;
  border-top: 4px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
