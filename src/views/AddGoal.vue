<template>
  <div class="page-container">
    <div class="content-container" :class="{ 'slide-left': isCreateMode }">
      <h1 class="greeting-title">Ola, {{ userName }}</h1>
      <div class="no-goals-card">
        <p class="no-goals-text">You have no goals currently setup</p>
      </div>
      <button class="setup-button" @click="startCreateGoal">Set up Goal</button>

      <!-- Navbar slides with initial view -->
      <div class="navbar-container">
        <Navbar />
      </div>
    </div>

    <!-- Create Goal Form Section -->
    <div
      class="create-goal-container"
      :class="{ 'slide-in': isCreateMode, 'slide-left': showActivities }">
      <h2 class="create-goal-title">Creating a new Goal</h2>

      <form class="goal-form" @submit.prevent>
        <div class="form-group">
          <label class="form-label">Give your goal name</label>
          <input
            type="text"
            v-model="goalForm.name"
            class="form-input"
            placeholder="Enter goal name" />
        </div>

        <div class="form-group">
          <label class="form-label">How many days to complete goal</label>
          <input
            type="number"
            v-model="goalForm.days"
            class="form-input"
            min="1"
            max="30"
            @input="validateDays"
            placeholder="Enter number of days" />
        </div>
      </form>

      <div class="bottom-buttons">
        <button class="back-button" @click="goBack">
          <span class="material-icons">chevron_left</span>
          <span class="back-text">Back</span>
        </button>

        <button v-if="isValidDays" class="next-button" @click="handleNext">
          <span class="next-text">Next</span>
          <span class="material-icons">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- Add Activities Section -->
    <div
      class="add-activities-container"
      :class="{ 'slide-in': showActivities }">
      <h2 class="create-goal-title">Add new Activities</h2>

      <div class="activities-info-card">
        <p class="activities-info-text">
          Add new activities, the total points should be 100%
        </p>
        <div class="progress-section">
          <span class="progress-percentage">{{ totalPoints }}%</span>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: `${totalPoints}%` }"></div>
          </div>
        </div>
      </div>

      <div class="activities-list" v-if="activities.length > 0">
        <div
          v-for="activity in activities"
          :key="activity.name"
          class="activity-item">
          <span class="activity-name">{{ activity.name }}</span>
          <div class="activity-right">
            <span class="activity-points">{{ activity.points }}%</span>
            <button class="delete-button" @click="deleteActivity(activity)">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>
      </div>

      <div class="bottom-buttons activities-buttons">
        <button class="back-button pill" @click="goBackToGoalForm">
          <span class="material-icons">chevron_left</span>
          <span class="back-text">Back</span>
        </button>

        <button class="add-activity-button" @click="showDialog = true">
          Add Activity
        </button>
      </div>
    </div>

    <NewActivityDialog
      v-model:visible="showDialog"
      :totalPoints="totalPoints"
      @add-activity="handleAddActivity" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "@/supabase/config";
import Navbar from "../components/Navbar.vue";
import NewActivityDialog from "../components/NewActivityDialog.vue";

const userName = ref("");
const isCreateMode = ref(false);
const isValidDays = ref(false);
const showActivities = ref(false);
const goalForm = ref({
  name: "",
  days: "",
});
const showDialog = ref(false);
const activities = ref([]);

// Add computed property for total points
const totalPoints = computed(() => {
  return activities.value.reduce((sum, activity) => sum + activity.points, 0);
});

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.user_metadata?.full_name) {
    userName.value = user.user_metadata.full_name;
  }
});

function startCreateGoal() {
  isCreateMode.value = true;
}

function goBack() {
  isCreateMode.value = false;
}

function validateDays() {
  const days = Number(goalForm.value.days);
  isValidDays.value = days >= 1 && days <= 30;
}

function handleNext() {
  if (isValidDays.value) {
    showActivities.value = true;
  }
}

function goBackToGoalForm() {
  showActivities.value = false;
}

function handleAddActivity(activity) {
  activities.value.push(activity);
}

function deleteActivity(activity) {
  activities.value = activities.value.filter(a => a !== activity);
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  background-color: rgb(250 251 231);
  overflow: hidden;
  position: relative;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  transition: transform 0.3s ease-out;
}

.content-container.slide-left {
  transform: translateX(-100%);
}

.greeting-title {
  color: #232323;
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 2rem;
}

.no-goals-card {
  background-color: #eaeed3;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  margin-bottom: 2rem;
}

.no-goals-text {
  color: #232323;
  font-size: 1.125rem;
  font-weight: 500;
}

.setup-button {
  width: 100%;
  padding: 1rem;
  border-radius: 32px;
  background-color: #50a65d;
  color: white;
  border: none;
  font-size: 1.125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.setup-button:hover {
  background-color: #458f51;
}

.create-goal-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgb(250 251 231);
  padding: 2rem;
  padding-bottom: calc(4rem + 20px);
  transform: translateX(100%);
  transition: transform 0.3s ease-out;
  overflow-y: auto;
}

.create-goal-container.slide-in {
  transform: translateX(0);
}

.create-goal-container.slide-left {
  transform: translateX(-100%);
}

.add-activities-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgb(250 251 231);
  padding: 2rem;
  padding-bottom: calc(4rem + 20px);
  transform: translateX(100%);
  transition: transform 0.3s ease-out;
  overflow-y: auto;
}

.add-activities-container.slide-in {
  transform: translateX(0);
}

.create-goal-title {
  color: #232323;
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 2rem;
  text-align: left;
}

.navbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: transform 0.3s ease-out;
}

.content-container.slide-left .navbar-container {
  transform: translateX(-100%);
}

.goal-form {
  margin-top: 30px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2a332c;
  font-size: 1rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 32px;
  border: none;
  background-color: #eaeed3;
  color: #232323;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #50a65d;
}

.bottom-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgb(250 251 231);
  z-index: 100;
}

.activities-buttons {
  gap: 1rem;
}

.back-button,
.next-button {
  background-color: transparent;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #232323;
  gap: 0.5rem;
}

.back-button.pill {
  background-color: #50a65d;
  color: white;
  width: 30%;
}

.add-activity-button {
  width: 70%;
  padding: 1rem;
  border-radius: 32px;
  background-color: #50a65d;
  color: white;
  border: none;
  font-size: 1.125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.add-activity-button:hover,
.back-button.pill:hover {
  background-color: #458f51;
}

.back-button .material-icons,
.next-button .material-icons {
  font-size: 1.5rem;
}

.back-text,
.next-text {
  font-size: 1rem;
  font-weight: 500;
}

.activities-info-card {
  background-color: #eaeed3;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  margin-top: 1.5rem;
}

.activities-info-text {
  color: #232323;
  font-size: 1.125rem;
  font-weight: 500;
}

.activities-list {
  margin-top: 1.5rem;
}

.activity-item {
  background-color: #eaeed3;
  padding: 1rem 1.5rem;
  border-radius: 32px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-name {
  color: #232323;
  font-size: 1rem;
  font-weight: 500;
}

.activity-points {
  color: #232323;
  font-weight: 600;
}

.activity-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.delete-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #50a65d;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.2s ease;
}

.delete-button:hover {
  background-color: #458f51;
}

.delete-button .material-icons {
  font-size: 18px;
}

.progress-section {
  margin-top: 1rem;
  text-align: left;
  padding: 0 1rem;
}

.progress-percentage {
  color: #232323;
  font-size: 1rem;
  font-weight: 500;
  display: block;
  margin-bottom: 0.5rem;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: #ffffff;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #50a65d;
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>
