<template>
  <header class="header">
    <h1 class="user-greeting">Ola,{{ name }}</h1>
    <p class="date">{{ date }}</p>
  </header>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.header {
  padding: 1.5rem 1.5rem 0.5rem 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-greeting {
  font-size: 1.5rem;
  font-weight: 700;
  color: #232323;
  margin-bottom: 0.25rem;
}

.date {
  color: #232323;
  font-size: 0.875rem;
  text-align: center;
  width: 100%;
  font-weight: 700;
}
</style>
