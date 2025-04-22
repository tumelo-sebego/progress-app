<template>
  <div class="phone-frame">
    <div class="h-full flex-col-container">
      <!-- Sticky Header -->
      <div class="header-container">
        <div class="page-header" :class="{ 'header-hidden': isHeaderHidden }">
          <span class="material-icons">emoji_events</span>
          <span class="header-text">Goal Progress</span>
        </div>
      </div>

      <!-- Add goal title container -->
      <div class="goal-title-container">
        <h2 class="goal-title">{{ activeGoal?.title || "No Active Goal" }}</h2>
      </div>

      <div
        class="content-container"
        @scroll="handleScroll"
        ref="contentContainer">
        <!-- Progress Circle -->
        <div class="progress-container">
          <ProgressCircle :progress="activeGoal?.completionRate || 0" />
        </div>

        <!-- Days Left Container -->
        <div class="days-left-pill">
          <div class="left-group">
            <i class="pi pi-sun sun-icon"></i>
            <span class="days-text">Days left to completion</span>
          </div>
          <div class="right-group">
            <span class="vertical-line"></span>
            <div class="days-count">
              <span class="count-value">{{ daysLeft }}</span>
            </div>
          </div>
        </div>

        <!-- Points Container -->
        <div class="points-pill">
          <div class="left-group">
            <i class="pi pi-star-fill points-icon"></i>
            <span class="points-text">Total Points</span>
          </div>
          <div class="right-group">
            <span class="vertical-line"></span>
            <div class="points-count">
              <span class="count-value"
                >{{ activeGoal?.totalPoints || 0 }}/{{ possiblePoints }}</span
              >
            </div>
          </div>
        </div>

        <!-- Progress Trend Container -->
        <div class="trend-container">
          <div class="trend-header">
            <span class="trend-text">Progress Trend</span>
          </div>

          <div class="chart-container">
            <Chart type="line" :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <div class="impression-pill">
          <div class="left-group">
            <div class="status-dot" :class="impressionColorClass"></div>
            <span class="impression-text">{{ impressionText }}</span>
          </div>
        </div>
      </div>

      <Navbar :active="'calendar'" :activeGoal="'goal'" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useGoalSettingsStore } from "@/store/goalSettings";
import { useActivitiesStore } from "@/store/activities"; // Add this import
import ProgressCircle from "@/components/ProgressCircle.vue";
import Navbar from "@/components/Navbar.vue";
import Chart from "primevue/chart";

const goalStore = useGoalSettingsStore();
const store = useActivitiesStore(); // Add this line
const contentContainer = ref(null);
const isHeaderHidden = ref(false);
let lastScrollPosition = 0;

const activeGoal = computed(() => goalStore.getActiveGoal);

// Calculate days left until goal completion
const daysLeft = computed(() => {
  console.log("activeGoal.value", activeGoal.value);
  if (!activeGoal.value?.endDate) return 0;

  const endDate = new Date(activeGoal.value.endDate);
  const today = new Date();
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
});

// Add computed property for possible points
const possiblePoints = computed(() => {
  if (!activeGoal.value) return 0;
  return activeGoal.value.totalDays * 100; // Each day can earn 100 points
});

function handleScroll(event) {
  const currentScroll = event.target.scrollTop;
  if (Math.abs(currentScroll - lastScrollPosition) > 5) {
    isHeaderHidden.value =
      currentScroll > lastScrollPosition && currentScroll > 50;
    lastScrollPosition = currentScroll;
  }
}

// Add to script setup section
const chartData = computed(() => {
  if (!activeGoal.value) return null;

  const startDate = new Date(activeGoal.value.firstActiveDate);
  const endDate = new Date(activeGoal.value.endDate);
  const days = [];
  const points = [];

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    days.push(""); // Empty string for x-axis labels
    // Get points for this day from activities
    const dayPoints = store
      .getActivitiesByDate(currentDate.toISOString())
      .filter((activity) => activity.status === "done")
      .reduce((sum, activity) => sum + activity.points, 0);
    points.push(dayPoints);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    labels: days,
    datasets: [
      {
        label: "Points",
        data: points,
        fill: false,
        borderColor: "#50a65d",
        tension: 0.4,
        pointBackgroundColor: "#50a65d",
      },
    ],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        stepSize: 100,
        color: "#232323",
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        display: false,
      },
      title: {
        display: true,
        text: "Days",
        color: "#232323",
      },
    },
  },
}));

const impressionData = computed(() => {
  if (!activeGoal.value) return { color: "no-points", text: "No active goal" };

  const completionRate = activeGoal.value.completionRate;

  // Get recent activities (last 3 days including today)
  const today = new Date();
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 2); // -2 to include today

  const recentActivities = store.activities.filter((activity) => {
    const activityDate = new Date(activity.dateCreated);
    return (
      activityDate >= threeDaysAgo &&
      activityDate <= today &&
      activity.status === "done"
    );
  });

  // Calculate recent trend
  const recentDailyPoints = {};
  recentActivities.forEach((activity) => {
    const date = new Date(activity.dateCreated).toDateString();
    recentDailyPoints[date] = (recentDailyPoints[date] || 0) + activity.points;
  });

  const recentPointsArray = Object.values(recentDailyPoints);
  const trendDirection =
    recentPointsArray.length >= 2
      ? recentPointsArray[recentPointsArray.length - 1] -
        recentPointsArray[recentPointsArray.length - 2]
      : 0;

  // Determine impression based on both overall progress and recent activity
  if (completionRate >= 90) {
    return { color: "max-points", text: "Perfect! Keep it up!" };
  }

  if (completionRate >= 75) {
    return trendDirection >= 0
      ? { color: "high-points", text: "Excellent progress!" }
      : { color: "high-points", text: "Stay focused!" };
  }

  if (completionRate >= 50) {
    return trendDirection > 0
      ? { color: "medium-points", text: "You're doing better than before" }
      : { color: "medium-points", text: "Keep pushing!" };
  }

  if (
    completionRate >= 25 ||
    recentPointsArray.some((points) => points >= 50)
  ) {
    return trendDirection > 0
      ? { color: "low-points", text: "Making improvement" }
      : { color: "low-points", text: "You're falling behind" };
  }

  return trendDirection > 0
    ? { color: "no-points", text: "Starting to improve" }
    : { color: "no-points", text: "Not good, time to focus" };
});

const impressionColorClass = computed(() => impressionData.value.color);
const impressionText = computed(() => impressionData.value.text);
</script>

<style scoped>
.phone-frame {
  max-width: 440px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: rgb(250 251 231);
  color: #f1f3e6;
}

.h-full {
  height: 100%;
}

.flex-col-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header-container {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 1rem 0;
  background-color: rgb(250 251 231);
}

.page-header {
  background-color: #50a65d;
  color: #232323;
  padding: 0.25rem;
  border-radius: 9999px;
  width: 20rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.header-hidden {
  transform: translateY(-200%);
}

.content-container {
  flex: 1;
  padding: 0 1rem;
  overflow-y: auto;
  margin-bottom: 4rem;
  -webkit-overflow-scrolling: touch;
}

.progress-container {
  margin: 0 auto;
  display: flex;
  justify-content: center;
  max-width: 200px;
}

.days-left-pill,
.points-pill {
  margin: 1rem 0;
  padding: 0.75rem 1.5rem;
  background-color: #e6e7e9;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: stretch; /* Changed from center to stretch */
  justify-content: space-between;
  width: 100%;
  color: #232323;
  height: 3.5rem; /* Added fixed height */
}

.left-group,
.right-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 100%; /* Added to ensure full height */
}

.vertical-line {
  width: 2px;
  height: 100%; /* Changed to 100% */
  background-color: #232323;
  align-self: stretch; /* Added to ensure line stretches */
}

/* Remove line-height from count containers */
.days-count,
.points-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Added for vertical centering */
}

.sun-icon {
  color: #fbbf24;
  font-size: 1.25rem;
}

.points-icon {
  color: #ebc22b;
  font-size: 1.25rem;
}

.days-text {
  font-size: 1rem;
  font-weight: 500;
}

.points-text {
  font-size: 1rem;
  font-weight: 500;
}

.goal-title-container {
  padding: 1.5rem 2rem;
  background-color: rgb(250 251 231);
  text-align: center;
}

.goal-title {
  color: #232323;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  padding: 0;
  line-height: 1.2;
}

.trend-container {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: #e6e7e9;
  border-radius: 1rem;
}

.trend-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.trend-text {
  color: #232323;
  font-size: 1rem;
  font-weight: 500;
}

.chart-container {
  height: 140px;
  width: 100%;
}

.impression-pill {
  padding: 0.75rem 1.5rem;
  background-color: #e6e7e9;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  width: 100%;
  color: #232323;
  height: 3.5rem;
}

.status-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  margin-right: 0.75rem;
}

.status-dot.no-points {
  background-color: #232323;
}

.status-dot.low-points {
  background-color: #8c8c8c;
}

.status-dot.medium-points {
  background-color: #ebc22b;
}

.status-dot.high-points {
  background-color: #36aafe;
}

.status-dot.max-points {
  background-color: #50a65d;
}

.impression-text {
  font-size: 1rem;
  font-weight: 500;
  color: #232323;
}
</style>
