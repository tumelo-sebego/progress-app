// @vue/component
<template>
  <div class="progress-container">
    <!-- Progress Circle -->
    <Chart
      type="doughnut"
      :data="chartData"
      :options="chartOptions"
      class="small-chart" />
    <div class="progress-text" :style="{ color: progressTextColor }">
      {{ props.progress }}%
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from "vue";
import Chart from "primevue/chart";

/* eslint-disable no-undef */
const props = defineProps({
  progress: {
    type: Number,
    required: true,
    default: 0,
  },
});
/* eslint-enable no-undef */

const chartData = computed(() => ({
  labels: ["Progress"],
  datasets: [
    {
      data: [props.progress, 100 - props.progress],
      backgroundColor: ["#50a65d", "#232323"], // Updated colors: green for progress, dark grey for remaining
      borderWidth: 0,
      borderRadius: 20,
      hoverBorderWidth: 0,
      spacing: 0,
    },
  ],
}));

const chartOptions = computed(() => ({
  cutout: "85%",
  radius: 95,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  elements: {
    arc: {
      borderWidth: 0,
    },
  },
  animation: {
    animateRotate: true,
    animateScale: false,
    duration: 1000,
    easing: "easeOutCubic",
  },
  responsive: true,
  maintainAspectRatio: true,
}));

const progressTextColor = computed(() =>
  props.progress > 0 ? "#50a65d" : "#232323",
);
</script>

<style scoped>
.progress-container {
  position: relative;
  width: 200px;
  height: 200px;
  margin: auto;
  margin-bottom: 2rem;
}

.small-chart {
  width: 100%;
  height: 100%;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
  font-weight: 400;
}

:deep(.p-chart) canvas {
  stroke-linecap: round;
}
</style>
