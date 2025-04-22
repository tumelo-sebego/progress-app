<template>
  <div>
    <h2>Daily Progress: {{ progress }}%</h2>
  </div>
</template>

<script>
import { useActivityStore } from "@/store/activities";
import { computed, onMounted } from "vue";

export default {
  setup() {
    const activityStore = useActivityStore();

    onMounted(() => {
      activityStore.fetchActivities();
    });

    const progress = computed(() => activityStore.progress);

    return { progress };
  },
};
</script>
