<template>
  <div class="task-timer">
    <h2>{{ taskTitle }}</h2>
    <div class="timer">{{ formattedTime }}</div>
    <button @click="toggleTimer">
      {{ isRunning ? "Finish" : "Start" }}
    </button>
  </div>
</template>

<script>
import { completeTask } from "@/api.js";

export default {
  data() {
    return {
      taskTitle: this.$route.params.taskTitle, // Get task from URL params
      startTime: null,
      elapsedTime: 0,
      isRunning: false,
      interval: null,
    };
  },
  computed: {
    formattedTime() {
      const hours = Math.floor(this.elapsedTime / 3600)
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((this.elapsedTime % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (this.elapsedTime % 60).toString().padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    },
  },
  methods: {
    toggleTimer() {
      if (!this.isRunning) {
        // Start timer
        this.startTime = Date.now();
        this.interval = setInterval(() => {
          this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        }, 1000);
      } else {
        // Stop timer and send completion request
        clearInterval(this.interval);
        this.sendCompletion();
      }
      this.isRunning = !this.isRunning;
    },
    async sendCompletion() {
      try {
        await completeTask(this.taskTitle, this.elapsedTime);
        this.$router.push("/"); // Go back to Home after completion
      } catch (error) {
        console.error("Error completing task:", error);
      }
    },
  },
};
</script>

<style scoped>
.task-timer {
  text-align: center;
  padding: 20px;
}
.timer {
  font-size: 3rem;
  margin: 20px 0;
}
button {
  padding: 10px 20px;
  font-size: 1.2rem;
}
</style>
