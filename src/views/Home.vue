<template>
  <div v-if="!shouldShowContent" class="loading-container">
    <div class="loading-circle"></div>
  </div>

  <div class="phone-frame">
    <div class="h-full flex-col-container">
      <Header :name="username" :date="date" />

      <div class="content-container">
        <template v-if="activeTab === 'home'">
          <div class="progress-container">
            <ProgressCircle :progress="progress" />
          </div>

          <div class="activities-container">
            <ActivityItem
              v-for="activity in latestActivities"
              :key="activity.id"
              :activity="activity"
              :id="activity.id"
              @open-dialog="showDialog" />
          </div>

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
// import { useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import ProgressCircle from "@/components/ProgressCircle.vue";
import ActivityItem from "@/components/ActivityItem.vue";
import Navbar from "@/components/Navbar.vue";
import ActivityTimer from "@/components/ActivityTimer.vue";
// import { supabase } from "@/supabase/config";
import { useAppStore } from "@/store/app";

const appStore = useAppStore();
// const router = useRouter();
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
  const activities = store.getActivitiesByDate(todayStr) || [];

  // Sort activities with active ones first
  return activities.sort((a, b) => {
    // Active activities go to the top
    if (a.status === "active") return -1;
    if (b.status === "active") return 1;

    // Then sort by created_at date for remaining items
    return new Date(b.created_at) - new Date(a.created_at);
  });
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
  console.log("Loading tasks for goal:", activeGoal.value.id);
  await store.fetchActivitiesForGoal(activeGoal.value.id);
  store.restoreTimerState(); // Add this line
};

const progress = computed(() => {
  return latestActivities.value
    .filter((activity) => activity.status === "done")
    .reduce((total, activity) => total + activity.points, 0);
});

onMounted(async () => {
  // Format current date
  const today = new Date();
  const day = today.getDate();
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  const month = today.toLocaleDateString("en-US", { month: "long" });
  date.value = `${weekday}, ${month} ${day}${getOrdinalSuffix(day)}`;

  // Use stored user data
  username.value = appStore.userData?.full_name || "User";

  // Load tasks if we have an active goal
  if (hasActiveGoal.value) {
    await loadTasks();
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
