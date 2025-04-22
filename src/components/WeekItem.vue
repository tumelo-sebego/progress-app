<template>
  <div class="week-item" @click="$emit('show-details', week)">
    <div class="week-content">
      <div class="status-dot" :class="statusColorClass"></div>
      <div class="week-info">
        <div class="title">Week {{ week.weekNumber }}</div>
        <div class="active-days">
          <i class="pi pi-bolt"></i>
          <span class="days-text"
            >Active Days: {{ week.activeDays }}/{{ week.daysPerWeek }}</span
          >
        </div>
      </div>
      <div class="separator"></div>
      <div class="points-container">
        <span class="points-value">{{ week.percentageComplete }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from "vue";

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
});

defineEmits(["show-details"]);

// Status color based on percentage complete
const statusColorClass = computed(() => {
  const percentage = props.week.percentageComplete;
  if (percentage === 0) return "no-points";
  if (percentage <= 25) return "low-points";
  if (percentage <= 50) return "medium-points";
  if (percentage <= 75) return "high-points";
  return "max-points";
});
</script>

<style scoped>
.week-item {
  background-color: #eaeed3;
  border-radius: 1rem;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
}

.week-content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-height: 3.5rem;
  padding: 0 0.5rem;
}

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

.week-info {
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
}

.active-days {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transform: scale(0.9);
  transform-origin: left;
}

.active-days i {
  color: #50a65d;
  font-size: 1rem;
}

.days-text {
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
</style>
