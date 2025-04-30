<template>
  <div class="phone-frame">
    <div class="h-full flex-col-container">
      <!-- Sticky Header -->
      <div class="header-container">
        <div class="page-header" :class="{ 'header-hidden': isHeaderHidden }">
          <span class="material-icons">bolt</span>
          <span class="header-text">Daily Progress</span>
        </div>
      </div>

      <div
        class="content-container"
        @scroll="handleScroll"
        ref="contentContainer">
        <div class="days-container">
          <DayItem
            v-for="day in groupedActivities"
            :key="day.date"
            :activity-date="day.date.toISOString()"
            @show-details="showDayDetails(day.date)" />
        </div>

        <DayDetailsDialog
          v-model:visible="dayDetailsVisible"
          :activity-date="selectedDate" />

        <!-- ActivityTimer dialog -->
        <ActivityTimer
          v-if="selectedActivityId"
          v-model:visible="dialogVisible"
          :id="selectedActivityId" />
      </div>

      <Navbar :active="'calendar'" :activeGoal="'daily'" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useActivityStore } from "@/store/activities";
import { useGoalSettingsStore } from "@/store/goalSettings";
import DayItem from "@/components/DayItem.vue";
import Navbar from "@/components/Navbar.vue";
import ActivityTimer from "@/components/ActivityTimer.vue";
import DayDetailsDialog from "@/components/DayDetailsDialog.vue";

const store = useActivityStore();
const goalStore = useGoalSettingsStore();
const dialogVisible = ref(false);
const selectedActivityId = ref(null);
const dayDetailsVisible = ref(false);
const selectedDate = ref("");
const contentContainer = ref(null);
const isHeaderHidden = ref(false);
let lastScrollPosition = 0;

function handleScroll(event) {
  const currentScroll = event.target.scrollTop;

  // Only update if we've scrolled more than 5px to prevent tiny movements
  if (Math.abs(currentScroll - lastScrollPosition) > 5) {
    // Scrolling down
    if (currentScroll > lastScrollPosition && currentScroll > 50) {
      isHeaderHidden.value = true;
    }
    // Scrolling up
    else if (currentScroll < lastScrollPosition) {
      isHeaderHidden.value = false;
    }

    lastScrollPosition = currentScroll;
  }
}

// Group activities by date
const groupedActivities = computed(() => {
  const activeGoal = goalStore.activeGoal;
  console.log("Active Goal:", activeGoal);
  if (!activeGoal || !activeGoal.start_date) return [];

  const activities = store.activities;
  const goalStartDate = new Date(activeGoal.start_date);
  const goalEndDate = new Date(activeGoal.end_date);

  // Filter activities within goal date range
  const goalActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.created_at);
    return activityDate >= goalStartDate && activityDate <= goalEndDate;
  });

  const groups = goalActivities.reduce((acc, activity) => {
    const date = new Date(activity.created_at).toISOString().split("T")[0];

    if (!acc[date]) {
      acc[date] = {
        date: new Date(activity.created_at),
        activities: [],
      };
    }
    acc[date].activities.push(activity);
    return acc;
  }, {});

  // Change sort order to ascending (oldest first)
  return Object.values(groups).sort((a, b) => a.date - b.date);
});

function showDayDetails(date) {
  selectedDate.value = date;
  dayDetailsVisible.value = true;
}
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
  -webkit-overflow-scrolling: touch;
}

.days-container {
  display: flex;
  flex-direction: column;
  padding-bottom: calc(1px + 4rem);
}

.day-item {
  border-radius: 1rem;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.day-date {
  font-size: 1.1rem;
  font-weight: 500;
}

.day-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.duration-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #81c784;
}

.duration-group i {
  font-size: 1rem;
}

.progress-value {
  color: #81c784;
  font-weight: 500;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
