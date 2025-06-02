<template>
  <div class="phone-frame">
    <div class="h-full flex-col-container">
      <!-- Sticky Header -->
      <div class="header-container">
        <div class="page-header" :class="{ 'header-hidden': isHeaderHidden }">
          <span class="material-icons">star</span>
          <span class="header-text">Weekly Progress</span>
        </div>
      </div>

      <div
        class="content-container"
        @scroll="handleScroll"
        ref="contentContainer">
        <div class="weeks-container">
          <WeekItem
            v-for="week in groupedWeeks"
            :key="week.weekStart"
            :week="week"
            @show-details="showWeekDetails" />
        </div>

        <WeekDetailsDialog
          v-model:visible="weekDetailsVisible"
          :week="selectedWeek"
          v-if="weekDetailsVisible" />
      </div>

      <Navbar :active="'calendar'" :activeGoal="'weekly'" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useActivityStore } from "@/store/activities";
import { useGoalSettingsStore } from "@/store/goalSettings";
import WeekItem from "@/components/WeekItem.vue";
import Navbar from "@/components/Navbar.vue";
import WeekDetailsDialog from "@/components/WeekDetailsDialog.vue";

const store = useActivityStore();
const goalStore = useGoalSettingsStore();
const contentContainer = ref(null);
const isHeaderHidden = ref(false);
let lastScrollPosition = 0;

const weekDetailsVisible = ref(false);
const selectedWeek = ref({
  weekStart: "",
  weekNumber: 1,
  daysPerWeek: 5,
  percentageComplete: 0,
  activeDays: 0,
});

// Group activities by weeks based on active goal's start date
const groupedWeeks = computed(() => {
  const activeGoal = goalStore.activeGoal;
  if (!activeGoal || !activeGoal.start_date) return [];

  const startDate = new Date(activeGoal.start_date);
  const endDate = new Date(activeGoal.end_date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const weeks = [];
  let currentDate = new Date(startDate);
  let weekNumber = 1;

  while (currentDate <= endDate && currentDate <= today) {
    const weekStart = currentDate.toISOString();
    const weekEnd = new Date(currentDate);
    const daysPerWeek = activeGoal.daysPerWeek || 7;
    weekEnd.setDate(weekEnd.getDate() + (daysPerWeek - 1));

    // Get all activities for the week
    const weekActivities = store.activities.filter((activity) => {
      const activityDate = new Date(activity.created_at);
      activityDate.setHours(0, 0, 0, 0);
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(weekEnd);
      endOfDay.setHours(23, 59, 59, 999);

      return (
        activityDate >= startOfDay &&
        activityDate <= endOfDay &&
        activity.status === "done"
      );
    });

    // Count unique days with activities
    const activeDays = new Set(
      weekActivities
        .filter(activity => new Date(activity.created_at) <= today)
        .map(activity => new Date(activity.created_at).toDateString())
    ).size;

    // Calculate total points earned
    const totalPoints = weekActivities
      .filter(activity => new Date(activity.created_at) <= today)
      .reduce((sum, activity) => sum + (activity.points || 0), 0);

    // Calculate max possible points based on total days in week
    const maxPoints = daysPerWeek * 100;
    const percentageComplete = Math.round((totalPoints / maxPoints) * 100);

    weeks.push({
      weekStart,
      weekNumber,
      daysPerWeek,
      percentageComplete,
      activeDays,
      availableDays: activeDays,     // Number of days with activities
      totalDays: daysPerWeek,        // Total days expected in the week
      adjustedWeekEnd: weekEnd.toISOString(),
      totalPoints,                    // Add total points for reference
      maxPoints                       // Add max points for reference
    });

    currentDate.setDate(currentDate.getDate() + daysPerWeek);
    weekNumber++;
  }

  return weeks;
});

function handleScroll(event) {
  const currentScroll = event.target.scrollTop;
  if (Math.abs(currentScroll - lastScrollPosition) > 5) {
    isHeaderHidden.value =
      currentScroll > lastScrollPosition && currentScroll > 50;
    lastScrollPosition = currentScroll;
  }
}

function showWeekDetails(week) {
  selectedWeek.value = {
    weekStart: week.weekStart,
    weekNumber: week.weekNumber,
    daysPerWeek: week.daysPerWeek || 5,
    percentageComplete: week.percentageComplete || 0,
    activeDays: week.activeDays || 0,
  };
  weekDetailsVisible.value = true;
}
</script>

<style scoped>
.phone-frame {
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
  background-color: rgb(250 251 231);
  padding: 1rem 0;
}

.page-header {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  background-color: #50a65d;
  color: #232323;
  padding: 0.25rem;
  border-radius: 9999px;
  width: 20rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.header-hidden {
  transform: translate(-50%, -200%);
}

.content-container {
  flex: 1;
  padding: 0 1rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  margin-top: 5rem; /* Add margin-top to prevent content from going under header */
}

.weeks-container {
  display: flex;
  flex-direction: column;
  padding-bottom: calc(1px + 4rem);
}
</style>
