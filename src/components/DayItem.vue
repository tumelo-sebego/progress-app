<template>
  <div class="day-item" @click="$emit('show-details')">
    <div class="day-content">
      <div class="status-dot" :class="statusColorClass"></div>
      <div class="day-info">
        <div class="title">{{ formattedDate }}</div>
        <div class="time-range">
          <i class="pi pi-clock"></i>
          <span class="time-text">{{ dayTimeRange }}</span>
        </div>
      </div>
      <div class="separator"></div>
      <div class="points-container">
        <span class="points-value">{{ totalPoints }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from "vue";
import { useActivityStore } from "@/store/activities";

const props = defineProps({
  activityDate: {
    type: String, // Date string as ID
    required: true,
  },
});

defineEmits(["show-details"]);

const store = useActivityStore();

// Get activities for this day using getActivitiesByDate
const dayActivities = computed(() => {
  return store.getActivitiesByDate(props.activityDate);
});

// Format the date (e.g., "Mon, March 24th")
const formattedDate = computed(() => {
  const date = new Date(props.activityDate);
  const day = date.getDate();
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "long" });

  function getOrdinalSuffix(d) {
    if (d >= 11 && d <= 13) return "th";
    switch (d % 10) {
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

  return `${weekday}, ${month} ${day}${getOrdinalSuffix(day)}`;
});

// Calculate time range from first to last completed activity
const dayTimeRange = computed(() => {
  const completedActivities = dayActivities.value.filter(
    (activity) => activity.status === "done",
  );

  if (!completedActivities.length) return "Expired";
  const times = completedActivities.map(
    (activity) => new Date(activity.start_time),
  );
  const firstTime = new Date(Math.min(...times));
  const lastTime = new Date(Math.max(...times));

  // Format times as HH:mm
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return `${formatTime(firstTime)} - ${formatTime(lastTime)}`;
});

// Calculate total points from completed activities
const totalPoints = computed(() => {
  return dayActivities.value
    .filter((activity) => activity.status === "done")
    .reduce((total, activity) => total + activity.points, 0);
});

// Add computed property for status color
const statusColorClass = computed(() => {
  const points = totalPoints.value;
  if (points === 0) return "no-points";
  if (points <= 25) return "low-points";
  if (points <= 50) return "medium-points";
  if (points <= 75) return "high-points";
  return "max-points";
});
</script>

<style scoped>
.status-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  margin-right: 0.5rem;
  flex-shrink: 0;
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

.day-item {
  background-color: #eaeed3;
  border-radius: 1rem;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
}

.day-content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-height: 3.5rem;
  padding: 0 0.5rem;
}

.day-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 1.5rem;
  margin-right: 2rem;
  width: 200px;
}

.title {
  font-weight: 500;
  color: #232323;
  font-size: 1.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transform: scale(0.9);
  transform-origin: left;
}

.time-range i {
  color: #50a65d;
  font-size: 1rem;
}

.time-text {
  color: #232323;
  font-size: 0.875rem;
}

.separator {
  width: 2px;
  background-color: rgba(35, 35, 35, 0.3);
  align-self: stretch;
  margin: 0;
}

.points-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  margin-left: 1rem;
  padding-right: 1rem;
}

.points-value {
  color: #232323;
  font-weight: 500;
  font-size: 1.125rem;
}

.points-unit {
  color: #232323;
  font-size: 0.75rem;
  opacity: 0.8;
}
</style>
