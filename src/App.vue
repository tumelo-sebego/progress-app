<template>
  <router-view v-if="isReady" />
  <div v-else class="loading-container">
    <div class="loading-circle"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/store/app";
import { useGoalSettingsStore } from "@/store/goalSettings";
// import { supabase } from "@/supabase/config";

const router = useRouter();
const appStore = useAppStore();
const goalStore = useGoalSettingsStore();
const isReady = ref(false);

async function determineInitialRoute() {
  try {
    // Check authentication
    const isAuthenticated = await appStore.initializeAuth();
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Initialize goal store
    await goalStore.initialize();

    // Get current date for comparison
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

    // Determine correct route based on goal state
    const startDate = new Date(goalStore.activeGoal.start_date);
    const endDate = new Date(goalStore.activeGoal.end_date);

    if (endDate < today) {
      router.push("/add-goal");
    } else if (startDate > today) {
      router.push("/upcoming-goal");
    } else {
      router.push("/home");
    }
  } catch (error) {
    console.error("Error determining initial route:", error);
    router.push("/login");
  }
}

onMounted(async () => {
  await determineInitialRoute();
  isReady.value = true;
});
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
