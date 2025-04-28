<template>
  <div v-if="!shouldShowContent" class="loading-container">
    <div class="loading-circle"></div>
  </div>

  <router-view v-if="!hasActiveGoal" name="add-goal" />

  <div v-else class="phone-frame">
    <div class="h-full flex-col-container">
      <Header :name="username" :date="date" />

      <!-- Show AddGoal if no active goals -->

      <!-- Main Content when active goal exists -->
      <div class="content-container">
        <template v-if="activeTab === 'home'">
          <div class="progress-container">
            <ProgressCircle :progress="progress" />
          </div>

          <div class="activities-container">
            <ActivityItem
              v-for="activity in latestActivities"
              :key="activity.id"
              :id="activity.id"
              @open-dialog="showDialog" />
          </div>

          <!-- ActivityTimer dialog -->
          <ActivityTimer
            v-if="selectedActivityId"
            v-model:visible="dialogVisible"
            :id="selectedActivityId"
            @active-state="handleActiveState" />
        </template>
      </div>

      <Navbar :active="activeTab" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useActivityStore } from "@/store/activities";
import { useGoalSettingsStore } from "@/store/goalSettings";
import { useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import ProgressCircle from "@/components/ProgressCircle.vue";
import ActivityItem from "@/components/ActivityItem.vue";
import Navbar from "@/components/Navbar.vue";
import ActivityTimer from "@/components/ActivityTimer.vue";
import { supabase } from "@/supabase/config";
import { useAppStore } from "@/store/app";

const appStore = useAppStore();
const router = useRouter();
const store = useActivityStore();
const goalStore = useGoalSettingsStore();

const forceShow = ref(false);
const username = ref("");
const activeTab = ref("home");
const date = ref("");

const activeGoal = computed(() => goalStore.activeGoal);
const hasActiveGoal = computed(() => goalStore.hasActiveGoal);

const latestActivities = computed(() => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;
  return store.getActivitiesByDate(todayStr) || [];
});

const dialogVisible = ref(false);
const selectedActivityId = ref(null);

function showDialog(activityId) {
  selectedActivityId.value = activityId;
  dialogVisible.value = true;
}

function getOrdinalSuffix(day) {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

const loadTasks = async () => {
  if (!activeGoal.value) return;
  await store.fetchActivitiesForGoal(activeGoal.value.id);
};

const progress = computed(() => {
  return latestActivities.value
    .filter((activity) => activity.status === "done")
    .reduce((total, activity) => total + activity.points, 0);
});

const checkActiveGoal = async () => {
  activeGoal.value = await goalStore.getLatestActiveGoal();
  hasActiveGoal.value = !!activeGoal.value;
  goalStore.hasActiveGoal = hasActiveGoal.value; // Sync with store for Navbar
  if (!hasActiveGoal.value) {
    router.push("/add-goal");
  }
};

onMounted(async () => {
  // Format current date
  const today = new Date();
  const day = today.getDate();
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  const month = today.toLocaleDateString("en-US", { month: "long" });
  date.value = `${weekday}, ${month} ${day}${getOrdinalSuffix(day)}`;

  let timeoutId;
  if (!appStore.isAppInitialized) {
    // Start 3 second timeout
    timeoutId = setTimeout(() => {
      forceShow.value = true;
    }, 3000);

    // Only fetch user/auth info if not already initialized
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    appStore.user = user;
    if (user?.user_metadata?.full_name) {
      username.value = user.user_metadata.full_name;
    }

    await checkActiveGoal();
    if (hasActiveGoal.value) {
      await loadTasks();
    }

    appStore.isAppInitialized = true;
    if (timeoutId) clearTimeout(timeoutId);
    forceShow.value = false;
  } else {
    // Already initialized, just show content immediately
    console.log("App already initialized, showing content immediately.");
    forceShow.value = true;
    // Optionally, update username from store
    if (appStore.user?.user_metadata?.full_name) {
      username.value = appStore.user.user_metadata.full_name;
    }

    console.log("activeGoal is: ", activeGoal.value);
    console.log("hasActiveGoal is: ", hasActiveGoal.value);
    // Ensure activeGoal and activities are loaded
    if (!activeGoal.value) {
      await checkActiveGoal();
    }
    if (
      hasActiveGoal.value &&
      (!store.activities.length || !latestActivities.value.length)
    ) {
      await loadTasks();
    }
  }
});

const shouldShowContent = computed(() => {
  return appStore.isAppInitialized || forceShow.value;
});
</script>

<style scoped>
.content-container {
  padding: 1rem;
}

.activities-container {
  margin-top: 1rem;
}

.progress-container {
  margin-bottom: 1rem;
}

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
