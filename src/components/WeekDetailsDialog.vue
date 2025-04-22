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
    class="week-details-dialog"
    transition="dialog">
    <div class="dialog-wrapper" :class="{ 'dialog-enter-active': visible }">
      <!-- Fixed Header Section -->
      <div class="fixed-header">
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
        <h2 class="dialog-title">Week {{ week.weekNumber }}</h2>

        <!-- Progress Circle -->
        <div class="progress-container">
          <ProgressCircle :progress="week.percentageComplete" />
        </div>

        <!-- Duration Summary -->
        <div class="duration-summary">
          <!-- Active Days Container (Left) -->
          <div class="summary-item">
            <i class="pi pi-bolt"></i>
            <span class="summary-text"
              >Active Days: {{ week.activeDays }}/{{ week.daysPerWeek }}</span
            >
          </div>

          <!-- Date Range Container (Right) -->
          <div class="summary-item dates">
            <i class="pi pi-calendar"></i>
            <span class="summary-text">{{ formattedDateRange }}</span>
          </div>
        </div>

        <!-- Days List -->
        <div class="days-container">
          <DayItem
            v-for="day in weekDays"
            :key="day.date"
            :activity-date="day.date"
            @show-details="showDayDetails(day.date)" />
        </div>
      </div>

      <!-- Nested DayDetailsDialog -->
      <DayDetailsDialog
        v-model:visible="dayDetailsVisible"
        :activity-date="selectedDayDate" />
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import ProgressCircle from "./ProgressCircle.vue";
import DayItem from "./DayItem.vue";
import DayDetailsDialog from "./DayDetailsDialog.vue";

const props = defineProps({
  week: {
    type: Object,
    required: true,
    validator: (obj) => {
      return [
        "weekStart",
        "weekNumber",
        "daysPerWeek",
        "percentageComplete",
        "activeDays",
      ].every((prop) => prop in obj);
    },
  },
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:visible"]);
const dayDetailsVisible = ref(false);
const selectedDayDate = ref("");

// Generate array of dates for the week
const weekDays = computed(() => {
  const days = [];
  const startDate = new Date(props.week.weekStart);

  for (let i = 0; i < props.week.daysPerWeek; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    days.push({
      date: currentDate.toISOString(),
    });
  }

  return days;
});

const formattedDateRange = computed(() => {
  const startDate = new Date(props.week.weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + props.week.daysPerWeek - 1);

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "long" });
    return `${day} ${month}`;
  };

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
});

function showDayDetails(date) {
  console.log("Received date:", date); // Debug log
  if (!date) return;

  selectedDayDate.value = date;
  dayDetailsVisible.value = true;
}

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
  margin: 1rem 0 2rem;
  margin-bottom: 0;
  font-size: 1.5rem;
  font-weight: 500;
  color: #232323;
  text-align: center;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 2rem 2rem;
  -webkit-overflow-scrolling: touch;
}

.progress-container {
  margin: 0 0 1rem;
  margin-bottom: 0;
  display: flex;
  justify-content: center;
}

.duration-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0 2rem;
  color: #232323;
  font-size: 1rem;
  padding: 0;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-item i {
  font-size: 1.25rem;
  color: #50a65d;
}

.summary-text {
  font-weight: 500;
}

.dates {
  font-size: 0.875rem;
}

.days-container {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
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
