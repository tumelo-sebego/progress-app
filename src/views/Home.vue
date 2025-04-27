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

        <template v-else-if="activeTab === 'calendar'">
          <div class="progress-view-container">
            <h2 class="section-title">Progress View</h2>

            <div class="progress-buttons-container">
              <Button
                class="progress-button"
                :class="
                  activeProgressType === 'daily'
                    ? 'active-button'
                    : 'inactive-button'
                "
                @click="handleProgressTypeChange('daily')">
                <i class="pi pi-bolt icon-spacing"></i>
                <span>Daily Progress</span>
              </Button>

              <Button
                class="progress-button"
                :class="
                  activeProgressType === 'weekly'
                    ? 'active-button'
                    : 'inactive-button'
                "
                @click="handleProgressTypeChange('weekly')">
                <i class="pi pi-star icon-spacing"></i>
                <span>Weekly Progress</span>
              </Button>

              <Button
                class="progress-button"
                :class="
                  activeProgressType === 'monthly'
                    ? 'active-button'
                    : 'inactive-button'
                "
                @click="handleProgressTypeChange('monthly')">
                <i class="pi pi-trophy icon-spacing"></i>
                <span>Monthly Progress</span>
              </Button>
            </div>

            <div class="progress-message">
              <p>
                {{ progressTypeMessage }}
              </p>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'profile'">
          <div class="profile-container">
            <div class="profile-content">
              <h2 class="section-title">User Profile</h2>
              <p class="secondary-text">
                Your profile information will appear here
              </p>
            </div>
          </div>
        </template>
      </div>

      <Navbar
        :active="activeTab"
        :active-goal="activeProgressType"
        @navigate="handleNavigate"
        @goal-select="handleProgressTypeChange" />
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
import Button from "primevue/button";
import { supabase } from "@/supabase/config";

const router = useRouter();
const store = useActivityStore();
const goalStore = useGoalSettingsStore();

const isInitialized = ref(false);
const forceShow = ref(false);
const username = ref("");
const activeTab = ref("home");
const date = ref("");
const activeProgressType = ref("daily");
const hasActiveGoal = ref(false);
const activeGoal = ref(null);

const latestActivities = computed(() => {
  return store.getLatestActivities;
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

const progressTypeMessage = computed(() => {
  switch (activeProgressType.value) {
    case "daily":
      return "Your daily progress stats will appear here";
    case "weekly":
      return "Your weekly progress summary will appear here";
    case "monthly":
      return "Your monthly achievements will appear here";
    default:
      return "";
  }
});

const checkAuth = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    router.push("/login");
    return false;
  }
  return true;
};

const loadTasks = async () => {
  if (!activeGoal.value) return;
  await store.fetchActivitiesForGoal(activeGoal.value.id);
};

const handleNavigate = (tab) => {
  activeTab.value = tab;
};

const handleProgressTypeChange = (type) => {
  activeProgressType.value = type;
};

const progress = computed(() => {
  return latestActivities.value
    .filter((activity) => activity.status === "done")
    .reduce((total, activity) => total + activity.points, 0);
});

const checkActiveGoal = async () => {
  activeGoal.value = await goalStore.getLatestActiveGoal();
  hasActiveGoal.value = !!activeGoal.value;
  if (!hasActiveGoal.value) {
    router.push("/add-goal");
  }
};

onMounted(async () => {
  // Start 3 second timeout
  setTimeout(() => {
    forceShow.value = true;
  }, 3000);

  // Format current date
  const today = new Date();
  const day = today.getDate();
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  const month = today.toLocaleDateString("en-US", { month: "long" });
  date.value = `${weekday}, ${month} ${day}${getOrdinalSuffix(day)}`;

  const isAuthenticated = await checkAuth();
  if (isAuthenticated) {
    await checkActiveGoal();
    if (hasActiveGoal.value) {
      await loadTasks();
    }
  }
  isInitialized.value = true;
});

const shouldShowContent = computed(() => {
  return isInitialized.value || forceShow.value;
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
