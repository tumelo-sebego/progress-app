<template>
  <Dialog
    :visible="visible"
    @hide="onClose"
    modal
    :closable="false"
    :showHeader="false"
    :dismissableMask="true"
    :contentStyle="{ padding: '0', height: '100vh' }"
    :style="{
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      margin: '0',
      borderRadius: '0',
    }"
    position="top"
    class="day-details-dialog"
    transition="dialog">
    <div class="dialog-wrapper" :class="{ 'dialog-enter-active': visible }">
      <!-- Fixed Header Section -->
      <div class="">
        <div class="close-button-container">
          <Button
            icon="pi pi-times"
            @click="onClose"
            text
            class="close-button" />
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="scrollable-content">
        <h2 class="dialog-title">{{ formattedDate }}</h2>
        <!-- Progress Circle -->
        <div class="progress-container">
          <ProgressCircle :progress="dayProgress" />
        </div>

        <!-- Duration Summary -->
        <div class="duration-summary">
          <i class="pi pi-clock"></i>
          <span class="duration-text">Duration: {{ totalDuration }}</span>
        </div>

        <!-- Activities List -->
        <div class="activities-container">
          <ActivityItem
            v-for="activity in dayActivities"
            :key="activity.id"
            :id="activity.id"
            @open-dialog="showActivityDialog" />
        </div>
      </div>

      <!-- ActivityTimer Dialog -->
      <ActivityTimer
        v-if="selectedActivityId"
        v-model:visible="activityDialogVisible"
        :id="selectedActivityId" />
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { useActivitiesStore } from "@/store/activities";
import ActivityItem from "./ActivityItem.vue";
import ProgressCircle from "./ProgressCircle.vue";
import ActivityTimer from "./ActivityTimer.vue";

const props = defineProps({
  activityDate: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:visible"]);
const store = useActivitiesStore();

const activityDialogVisible = ref(false);
const selectedActivityId = ref(null);

// Get activities for this day
const dayActivities = computed(() => {
  return store.getActivitiesByDate(props.activityDate);
});

// Format the date
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

// Calculate day's progress
const dayProgress = computed(() => {
  return dayActivities.value
    .filter((activity) => activity.status === "done")
    .reduce((total, activity) => total + activity.points, 0);
});

// Calculate total duration with seconds
const totalDuration = computed(() => {
  const totalSeconds = dayActivities.value.reduce((sum, activity) => {
    return sum + (activity.duration || 0);
  }, 0);

  // Convert to hours, minutes, seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format based on duration length
  if (hours > 0) {
    // 1h15min
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  } else if (minutes > 0) {
    // 1min15sec
    return seconds > 0 ? `${minutes}min ${seconds}sec` : `${minutes}min`;
  } else {
    // 17sec
    return `${seconds}sec`;
  }
});

// Show ActivityTimer dialog
function showActivityDialog(activityId) {
  selectedActivityId.value = activityId;
  activityDialogVisible.value = true;
}

// Close dialog
function onClose() {
  emit("update:visible", false);
}
</script>

<style scoped>
.dialog-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: rgb(250 251 231);
  position: relative;
  transform: translateY(-100%);
  opacity: 0;
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.dialog-enter-active {
  transform: translateY(0);
  opacity: 1;
}

/* Fixed header section */
.fixed-header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: rgb(250 251 231);
  padding: 1rem 2rem;
}

.close-button-container {
  position: absolute;
  top: 1rem;
  left: 1rem;
}

.close-button {
  background-color: rgba(255, 255, 255, 0.7) !important;
  border-radius: 50% !important;
  width: 2.5rem !important;
  height: 2.5rem !important;
}

.dialog-title {
  margin-top: 4rem;
  margin-bottom: 0;
  font-size: 1.5rem;
  font-weight: 500;
  color: #232323;
  text-align: center;
}

/* Scrollable content section */
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem 2rem;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

.progress-container {
  margin: 1rem 0;
  margin-bottom: 0;
  margin-top: 0;
  display: flex;
  justify-content: center;
}

/* Duration summary section */
.duration-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0 2rem;
  color: #232323;
  font-size: 1rem;
}

.duration-summary i {
  color: #50a65d;
}

.duration-text {
  font-weight: 500;
}

.activities-container {
  display: flex;
  flex-direction: column;
}

:deep(.p-dialog-mask) {
  background-color: rgb(250 251 231);
}

:deep(.p-dialog) {
  margin: 0;
  color: #232323;
  overflow: visible;
  height: 100vh;
  max-height: 100vh;
  border-radius: 0;
}

:deep(.p-dialog-content) {
  padding: 0;
  background-color: rgb(250 251 231);
  overflow: visible !important;
}
</style>
