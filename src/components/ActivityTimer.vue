<script setup>
import { ref, computed, onUnmounted, onMounted, watch, defineProps, defineEmits } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import { useActivitiesStore } from "@/store/activities";

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  visible: {
    type: Boolean,
    required: true,
  },
});

const store = useActivitiesStore();
const activity = computed(() => store.getActivityById(props.id));
// const elapsedTime = ref(activity.value.duration || 0);

// Variables for elapsed time and active elapsed time
const elapsedTime = ref(0);
const activeElapsedTime = ref(0); // Background counter for active activities

const emit = defineEmits(["update:visible", "complete", "active-state"]);

const timer = ref(null);

const formattedTime = computed(() => {
  const valueTime =
    activity.value.status === "active"
      ? store.activeElapsedTime
      : activity.value.duration || 0;

  const hours = Math.floor(valueTime / 3600);
  const minutes = Math.floor((valueTime % 3600) / 60);
  const seconds = Math.floor(valueTime % 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;
});

// Initialize elapsedTime based on activity status
function initializeElapsedTime() {
  if (activity.value.status === "active") {
    elapsedTime.value = activeElapsedTime.value;
  } else if (activity.value.status === "done") {
    elapsedTime.value = activity.value.duration || 0;
  } else {
    elapsedTime.value = 0;
  }
}

// Start and stop the timer
function startTimer() {
  store.startActivity(activity.value.id);
}

function stopTimer() {
  store.stopActivity(activity.value.id);
}

function onClose() {
  emit("update:visible", false); // Notify parent to close the dialog
}

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value); // Clean up the timer when the component is unmounted
  }
});

// Call initializeElapsedTime when the component is mounted
onMounted(() => {
  initializeElapsedTime();
});

// Helper function to add ordinal suffix to the day
function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "th"; // Covers 11th to 19th
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

// Computed property to format timeActive
const formattedTimeActive = computed(() => {
  if (!activity.value.timeActive) return "N/A";
  const date = new Date(activity.value.timeActive);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
});

// Computed property to format timeDone
const formattedTimeDone = computed(() => {
  if (!activity.value.timeDone) return "N/A";
  const date = new Date(activity.value.timeDone);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
});

// Computed property to format the created date
const formattedCreatedDate = computed(() => {
  const date = new Date(activity.value.dateCreated);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  return `${day}${getOrdinalSuffix(day)} ${month}`;
});

watch(
  () => activity.value.id,
  () => {
    initializeElapsedTime(); // Reinitialize elapsedTime when activity status changes
  },
);

// Reactive state for action button
</script>

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
    class="activity-dialog"
    transition="dialog">
    <div class="dialog-wrapper" :class="{ 'dialog-enter-active': visible }">
      <div class="close-button-container">
        <Button icon="pi pi-times" @click="onClose" text class="close-button" />
      </div>
      <h2 class="dialog-title">{{ activity.title }}</h2>
      <div class="timer-display">
        {{ formattedTime }}
      </div>

      <!-- Activity Points Pill -->
      <div class="activity-points-pill">
        <div class="bolt-icon-group">
          <i class="pi pi-bolt bolt-icon"></i>
          <span class="points-text">Activity Points</span>
        </div>
        <div class="points-group">
          <span class="vertical-line"></span>
          <span class="points-value">{{ activity.points }}%</span>
        </div>
      </div>

      <!-- Activity Details Pill -->
      <div
        v-if="activity.status === 'expired' || activity.status === 'done'"
        class="activity-details-pill">
        <div class="details-group">
          <i class="pi pi-calendar calendar-icon"></i>
          <span class="details-date">
            {{ formattedCreatedDate }}
          </span>
        </div>
        <div v-if="activity.status !== 'expired'" class="details-group">
          <span class="vertical-line"></span>
          <span class="details-time">{{ formattedTimeActive }}</span>
          <span>-</span>
          <span class="details-time">{{ formattedTimeDone }}</span>
        </div>
      </div>

      <!-- Activity Status Pill -->
      <div class="activity-status-pill">
        <div class="status-group">
          <span
            class="status-dot"
            :class="{
              pending: activity.status === 'pending',
              active: activity.status === 'active',
              done: activity.status === 'done',
              expired: activity.status === 'expired',
            }"></span>
          <span class="status-text">{{ activity.status }}</span>
        </div>
      </div>

      <!-- Action Buttons Pill -->
      <div
        v-if="activity.status === 'pending' || activity.status === 'active'"
        class="action-buttons-pill"
        :class="{
          clicked: activity.status === 'active',
          disabled: store.hasActiveActivity && activity.status == 'pending',
        }"
        @click="activity.status === 'active' ? stopTimer() : startTimer()">
        <span class="action-text">{{
          activity.status === "active" ? "Finish" : "Start"
        }}</span>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.activity-timer-dialog {
  padding: 0;
}

.dialog-header {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
}

.activity-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  height: calc(100vh - 6rem);
  background-color: rgb(250 251 231);
}

.activity-title {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 2rem;
  color: #232323;
}

.timer-display {
  background-color: #eaeed3;
  font-size: 2rem;
  font-weight: 700;
  border-radius: 50%;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.time {
  font-size: 2.5rem;
  font-weight: 500;
  color: #232323;
  font-variant-numeric: tabular-nums;
}

.activity-points {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 9999px;
}

.points {
  font-weight: 500;
  margin-left: 0.5rem;
}

.status-indicator {
  margin-bottom: 2rem;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-indicator.pending {
  background-color: #4299e1;
  color: white;
}

.status-indicator.active {
  background-color: #f472b6;
  color: white;
}

.status-indicator.done {
  background-color: #50a65d;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

:deep(.p-dialog-mask) {
  background-color: rgb(250 251 231);
  pointer-events: auto !important; /* Ensure the dialog is interactive */
}

:deep(.p-dialog) {
  background-color: white !important;
  margin: 0;
  color: #232323;
  overflow: visible;
  pointer-events: auto !important; /* Ensure the dialog is interactive */
  height: 100vh;
  max-height: 100vh;
  border-radius: 0;
  z-index: 1050 !important;
}

:deep(.p-dialog-content) {
  padding: 0;
  background-color: rgb(250 251 231);
  overflow: visible !important;
}

:deep(.p-dialog-header) {
  padding: 0;
  background-color: transparent;
  border: none;
}

.dialog-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
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

.close-button-container {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
}

.close-button {
  background-color: rgba(255, 255, 255, 0.7) !important;
  border-radius: 50% !important;
  width: 2.5rem !important;
  height: 2.5rem !important;
}

.dialog-title {
  margin-top: 2rem;
  font-size: 1.5rem;
  font-weight: 500;
  color: #232323;
}

.activity-points,
.activity-status {
  margin: 1rem 0;
  font-size: 1.2rem;
}

.activity-details {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #555;
}

.activity-details p {
  margin: 0.5rem 0;
}

.action-buttons {
  margin-top: 2rem;
}

/* Add styles for the activity points pill */
.activity-points-pill {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background-color: #e6e7e9;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Space between left and right groups */
  width: 100%; /* Full width */
  color: #232323;
}

.bolt-icon-group {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Space between the bolt icon and text */
}

.points-group {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Space between the vertical line and points */
}

.bolt-icon {
  color: #fbbf24; /* Yellow color for the bolt icon */
  font-size: 1.2rem;
}

.points-text {
  font-size: 1rem;
  font-weight: 500;
}

.vertical-line {
  width: 2px; /* Increased width to match activity-points-pill */
  height: 1.5rem;
  background-color: #232323;
}

.points-value {
  font-size: 1rem;
  font-weight: 700;
}

/* Add styles for the activity details pill */
.activity-details-pill {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background-color: #e6e7e9;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Space between left and right groups */
  width: 100%; /* Full width */
  color: #232323;
}

.details-group {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Space between the icon and text */
}

.calendar-icon {
  color: #4299e1; /* Blue color for the calendar icon */
  font-size: 1.2rem;
}

.details-date,
.details-time {
  font-size: 1rem;
  font-weight: 500;
}

/* Add styles for the activity status pill */
.activity-status-pill {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background-color: #e6e7e9;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; /* Full width */
  color: #232323;
}

.status-group {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Space between the dot and the text */
}

.status-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: #d1d5db; /* Default gray color */
}

.status-dot.pending {
  background-color: #4299e1; /* Blue for pending */
}

.status-dot.active {
  background-color: #bf2f91; /* Pink for active */
}

.status-dot.done {
  background-color: #50a65d; /* Green for done */
}

.status-dot.expired {
  background-color: #232323; /* Red for expired */
}

.status-text {
  font-size: 1rem;
  font-weight: 500;
  text-transform: capitalize; /* Capitalize the status text */
}

/* Updated styles for all pill containers */
.activity-points-pill,
.activity-details-pill,
.activity-status-pill {
  margin-top: 0; /* Remove margin-top */
  margin-bottom: 1rem; /* Add margin-bottom */
  padding: 0.5rem 1rem;
  background-color: #e6e7e9;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Space between left and right groups */
  width: 100%; /* Full width */
  color: #232323;
}

/* Styles for the action buttons pill */
.action-buttons-pill {
  margin: 1rem 0; /* Keep the existing margin */
  padding: 0.5rem 1rem;
  background-color: #50a65d;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; /* Full width */
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.action-buttons-pill.clicked {
  background-color: #232323;
  color: #e5e7eb;
}

.action-buttons-pill.disabled {
  background-color: #d1d5db; /* Gray background for disabled state */
  color: #9ca3af; /* Light gray text for disabled state */
  cursor: not-allowed; /* Change cursor to indicate disabled state */
  pointer-events: none; /* Prevent any interaction */
}

.action-text {
  font-size: 1rem;
  font-weight: 500;
  color: inherit;
}
</style>
