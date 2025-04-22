<template>
  <div>
    <h2>Today's Activities</h2>
    <ul>
      <li v-for="activity in dailyActivities" :key="activity.id">
        <span :class="{ completed: activity.completed }">
          {{ activity.title }} - {{ activity.points }} pts
          <span v-if="activity.duration">({{ activity.duration }} min)</span>
        </span>
        <button
          v-if="!activity.completed"
          @click="completeActivity(activity.id)">
          ✔ Complete
        </button>
      </li>
    </ul>
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

    return {
      dailyActivities: computed(() => activityStore.getDailyActivities),
      completeActivity: activityStore.completeActivity
    };
  }
};
</script>

<style>
.completed {
  text-decoration: line-through;
}
</style>
