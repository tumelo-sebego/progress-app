<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    :closable="false"
    class="dialog-container">
    <template #header>
      <h3 class="dialog-title">New Activity</h3>
    </template>

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
    </form>

    <template #footer>
      <button class="submit-button" @click="handleSubmit" :disabled="!isValid">
        Add Activity
      </button>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import Dialog from "primevue/dialog";

defineProps({
  visible: {
    type: Boolean,
    required: true,
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
}

function handleSubmit() {
  if (!isValid.value) return;

  emit("add-activity", {
    name: form.value.name,
    points: Number(form.value.points),
  });

  // Reset form
  form.value = {
    name: "",
    points: "",
  };

  // Close dialog
  emit("update:visible", false);
}
</script>

<style scoped>
.dialog-container {
  width: 90vw;
  max-width: 500px;
}

.dialog-container :deep(.p-dialog-header) {
  padding: 1.5rem;
  background-color: rgb(250 251 231);
}

.dialog-container :deep(.p-dialog-content) {
  padding: 0 1.5rem 1.5rem;
  background-color: rgb(250 251 231);
}

.dialog-container :deep(.p-dialog-footer) {
  padding: 1.5rem;
  background-color: rgb(250 251 231);
  display: flex;
  justify-content: center;
}

.dialog-title {
  color: #232323;
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
}

.activity-form {
  margin-top: 1rem;
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
</style>
