<template>
  <div class="page-container">
    <div class="content-container" :class="{ 'slide-left': isCreateMode }">
      <h1 class="greeting-title">Ola, {{ userName }}</h1>
      <div class="no-goals-card">
        <p class="no-goals-text">You have no goals currently setup</p>
      </div>
      <button class="setup-button" @click="startCreateGoal">
        Setup a new Goal
      </button>
    </div>

    <!-- Create Goal Form Section -->
    <div class="create-goal-container" :class="{ 'slide-in': isCreateMode }">
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

      <div class="navigation-buttons">
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

    <!-- Move Navbar outside the sliding containers -->
    <div class="navbar-container">
      <Navbar />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/supabase/config";
import Navbar from "../components/Navbar.vue";

const userName = ref("");
const isCreateMode = ref(false);
const isValidDays = ref(false);
const goalForm = ref({
  name: "",
  days: "",
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
    // Handle next step logic here
    console.log("Moving to next step with form data:", goalForm.value);
  }
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
  padding-bottom: calc(4rem + 40px); /* Add padding for navbar */
  transform: translateX(100%);
  transition: transform 0.3s ease-out;
}

.create-goal-container.slide-in {
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

.navigation-buttons {
  position: fixed;
  bottom: calc(4rem + 20px);
  left: 1rem;
  right: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
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

.back-button .material-icons,
.next-button .material-icons {
  font-size: 1.5rem;
}

.back-text,
.next-text {
  font-size: 1rem;
  font-weight: 500;
}
</style>
