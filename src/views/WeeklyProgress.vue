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
import { useActivitiesStore } from "@/store/activities";
import { useGoalSettingsStore } from "@/store/goalSettings";
import WeekItem from "@/components/WeekItem.vue";
import Navbar from "@/components/Navbar.vue";
import WeekDetailsDialog from "@/components/WeekDetailsDialog.vue";

const store = useActivitiesStore();
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
  const activeGoal = goalStore.getActiveGoal;
  if (!activeGoal || !activeGoal.firstActiveDate) return [];

  const startDate = new Date(activeGoal.firstActiveDate);
  const endDate = new Date(activeGoal.endDate);
  const weeks = [];
  let currentDate = new Date(startDate);
  let weekNumber = 1;

  while (currentDate <= endDate) {
    const weekStart = currentDate.toISOString();
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + (activeGoal.daysPerWeek - 1));

    // Get activities for this week
    const weekActivities = store.activities.filter((activity) => {
      const activityDate = new Date(activity.dateCreated);
      // Normalize dates by setting them to midnight
      activityDate.setHours(0, 0, 0, 0);
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(weekEnd);
      endOfDay.setHours(23, 59, 59, 999);

      const isInRange = activityDate >= startOfDay && activityDate <= endOfDay;
      const isDone = activity.status === "done";

      return isInRange && isDone;
    });
    // console.log("week activities: ", weekActivities);

    // Calculate active days (unique days with completed activities)
    const activeDays = new Set(
      weekActivities.map((activity) =>
        new Date(activity.dateCreated).toDateString(),
      ),
    ).size;

    // Calculate percentage complete
    const totalPoints = weekActivities.reduce(
      (sum, activity) => sum + activity.points,
      0,
    );
    const maxPoints = activeGoal.daysPerWeek * 100;
    const percentageComplete = Math.round((totalPoints / maxPoints) * 100);

    weeks.push({
      weekStart,
      weekNumber,
      daysPerWeek: activeGoal.daysPerWeek,
      percentageComplete,
      activeDays,
    });

    currentDate.setDate(currentDate.getDate() + activeGoal.daysPerWeek);
    weekNumber++;
  }

  console.log("Weeks : ", weeks);

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

.weeks-container {
  display: flex;
  flex-direction: column;
  padding-bottom: calc(1px + 4rem);
}
</style>
