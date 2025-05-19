<template>
  <div class="phone-frame">
    <div class="h-full flex-col-container">
      <Header :name="username" :date="date" />

      <div class="content-container">
        <div class="upcoming-card">
          <h2 class="upcoming-title">{{ activeGoal?.title }}</h2>
          <p class="upcoming-message">Your goal hasn't started yet</p>

          <div class="countdown-container">
            <div class="countdown-value">
              <span class="number">{{ countdown.days }}</span>
              <span class="label">days</span>
            </div>
            <div class="countdown-separator">:</div>
            <div class="countdown-value">
              <span class="number">{{ countdown.hours }}</span>
              <span class="label">hours</span>
            </div>
            <div class="countdown-separator">:</div>
            <div class="countdown-value">
              <span class="number">{{ countdown.minutes }}</span>
              <span class="label">mins</span>
            </div>
            <div class="countdown-separator">:</div>
            <div class="countdown-value">
              <span class="number">{{ countdown.seconds }}</span>
              <span class="label">secs</span>
            </div>
          </div>
        </div>
      </div>

      <Navbar :active="activeTab" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useGoalSettingsStore } from "@/store/goalSettings";
import { useAppStore } from "@/store/app";
import { useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import Navbar from "@/components/Navbar.vue";

const goalStore = useGoalSettingsStore();
const appStore = useAppStore();
const router = useRouter();
const activeTab = ref("home");
const username = ref("");
const date = ref("");

const activeGoal = computed(() => goalStore.activeGoal);

// Countdown logic
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });
let timer = null;

function updateCountdown() {
  if (!activeGoal.value?.start_date) return;

  const now = new Date();
  const start = new Date(activeGoal.value.start_date);
  const diff = start - now;

  if (diff <= 0) {
    if (timer) clearInterval(timer);
    router.push("/home"); // Navigate to home when goal starts
    return;
  }

  countdown.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

onMounted(async () => {
  // Check if we should be on this view
  const now = new Date();
  const start = new Date(goalStore.activeGoal?.start_date);

  if (!goalStore.activeGoal || start <= now) {
    router.push("/home");
    return;
  }

  // Initialize countdown
  updateCountdown();
  timer = setInterval(updateCountdown, 1000);

  // Set username if available
  if (appStore.user?.user_metadata?.full_name) {
    username.value = appStore.user.user_metadata.full_name;
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.content-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upcoming-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.upcoming-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #232323;
  margin-bottom: 1rem;
}

.upcoming-message {
  color: #666666;
  margin-bottom: 2rem;
}

.countdown-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.countdown-value {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.countdown-separator {
  font-size: 2rem;
  font-weight: bold;
  color: #50a65d;
  margin-top: -1rem;
}

.number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #50a65d;
}

.label {
  font-size: 0.875rem;
  color: #666666;
  margin-top: 0.25rem;
}
</style>
