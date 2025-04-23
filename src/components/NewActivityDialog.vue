<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    :closable="false"
    :showHeader="false"
    :dismissableMask="true"
    :contentStyle="{ padding: '0', height: '100vh' }"
    :style="{
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      margin: '0',
      borderRadius: '0',
    }"
    position="top"
    class="activity-dialog"
    transition="dialog">
    <div class="dialog-wrapper" :class="{ 'dialog-enter-active': visible }">
      <!-- Close button -->
      <div class="close-button-container">
        <Button
          icon="pi pi-times"
          @click="$emit('update:visible', false)"
          text
          class="close-button" />
      </div>

      <h2 class="dialog-title">New Activity</h2>

      <form class="activity-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">Activity Name</label>
          <input
            type="text"
            v-model="form.name"
            class="form-input"
            placeholder="Go for walk" />
        </div>

        <div class="form-group">
          <label class="form-label">Activity Points</label>
          <input
            type="number"
            v-model="form.points"
            class="form-input"
            min="1"
            max="100"
            placeholder="10"
            @input="validatePoints" />
        </div>

        <Button type="submit" :disabled="!isValid" class="submit-button">
          Add Activity
        </Button>
      </form>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import Dialog from "primevue/dialog";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  totalPoints: {
    type: Number,
    required: true,
    default: 0,
  },
});

const emit = defineEmits(["update:visible", "add-activity"]);

const form = ref({
  name: "",
  points: "",
});

const isValid = computed(() => {
  const points = Number(form.value.points);
  return form.value.name.trim() !== "" && points >= 1 && points <= 100;
});

function validatePoints() {
  let points = Number(form.value.points);
  if (points < 1) form.value.points = 1;
  if (points > 100) form.value.points = 100;
  const remaining = 100 - props.totalPoints;
  if (points > remaining) {
    form.value.points = remaining;
  }
}

const handleSubmit = () => {
  if (!isValid.value) return;

  emit("add-activity", {
    name: form.value.name,
    points: Number(form.value.points),
  });

  form.value = { name: "", points: "" };
  emit("update:visible", false);
};
</script>

<style scoped>
.dialog-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: rgb(250 251 231);
  position: relative;
  transform: translateY(-100%);
  opacity: 0;
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
  padding: 2rem;
}

.dialog-enter-active {
  transform: translateY(0);
  opacity: 1;
}

.close-button-container {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
}

.close-button {
  background-color: rgba(255, 255, 255, 0.7) !important;
  border-radius: 50% !important;
  width: 2.5rem !important;
  height: 2.5rem !important;
}

.dialog-title {
  margin-top: 2rem;
  font-size: 1.5rem;
  font-weight: 500;
  color: #232323;
  margin-bottom: 2rem;
}

.activity-form {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
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

.submit-button {
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

.submit-button:hover:not(:disabled) {
  background-color: #458f51;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.continue-option {
  margin-top: 1rem;
}

.form-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-text {
  margin-left: 0.5rem;
}

:deep(.p-dialog-mask) {
  background-color: rgb(250 251 231);
}

:deep(.p-dialog) {
  margin: 0;
  color: #232323;
  overflow: visible;
  height: 100vh;
  max-height: 100vh;
  border-radius: 0;
}

:deep(.p-dialog-content) {
  padding: 0;
  background-color: rgb(250 251 231);
  overflow: visible !important;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input[type="checkbox"] {
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  color: #2a332c;
  font-size: 1rem;
}
</style>
