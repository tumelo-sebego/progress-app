<template>
  <div class="add-activity-container">
    <h2>Add New Activity</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">Title:</label>
        <input id="title" v-model="activityData.title" type="text" required />
      </div>

      <div class="form-group">
        <label for="description">Description:</label>
        <textarea id="description" v-model="activityData.description" />
      </div>

      <div class="form-group">
        <label for="points">Points:</label>
        <input
          id="points"
          v-model.number="activityData.points"
          type="number"
          min="0" />
      </div>

      <div class="form-group">
        <label for="duration">Duration (minutes):</label>
        <input
          id="duration"
          v-model.number="activityData.duration"
          type="number"
          min="0" />
      </div>

      <button type="submit">Add Activity</button>
    </form>
  </div>
</template>

<script>
import { ref } from "vue";
import { useActivityStore } from "@/store/activities";
import { useRouter } from "vue-router";

export default {
  name: "AddActivity",
  setup() {
    const activityStore = useActivityStore();
    const router = useRouter();

    const activityData = ref({
      title: "",
      description: "",
      points: 0,
      duration: null,
    });

    const handleSubmit = async () => {
      try {
        await activityStore.addActivity(activityData.value);
        router.push("/");
      } catch (error) {
        console.error("Error adding activity:", error);
      }
    };

    return {
      activityData,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.add-activity-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
