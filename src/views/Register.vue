<template>
  <div class="register-page">
    <h1 class="app-title">Progress App</h1>

    <div class="register-section">
      <h2 class="register-header">Sign up</h2>

      <form @submit.prevent="register" class="register-form">
        <FloatLabel class="input-group">
          <InputText id="email" v-model="email" class="input-field" required />
          <label for="email">Email</label>
        </FloatLabel>

        <FloatLabel class="input-group">
          <Password
            id="password"
            v-model="password"
            toggleMask
            class="input-field"
            required
            :feedback="false" />
          <label for="password">Password</label>
        </FloatLabel>

        <Button label="Sign up" type="submit" class="register-button" />

        <router-link to="/login" custom v-slot="{ navigate }">
          <Button label="Login" class="login-button" @click="navigate" />
        </router-link>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase/config";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import FloatLabel from "primevue/floatlabel";

const router = useRouter();
const email = ref("");
const password = ref("");

async function register() {
  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    router.push("/login");
  } catch (error) {
    console.error("Registration failed", error.message);
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background-color: rgb(250 251 231);
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.app-title {
  text-align: center;
  color: #232323;
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 3rem;
}

.register-section {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.register-header {
  color: #232323;
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  text-align: left;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.input-group {
  width: 100%;
}

:deep(.input-field) {
  width: 100%;
  background-color: #eaeed3;
  border-radius: 32px;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password-input) {
  width: 100%;
  background-color: #eaeed3;
  border-radius: 32px;
}

:deep(.p-float-label label) {
  color: #232323;
}

:deep(.p-button-label) {
  color: #fafbe7;
}

.register-button {
  width: 100%;
  border-radius: 32px;
  margin-top: 1rem;
  background-color: #50a65d;
  border: none;
}

.login-button {
  width: 100%;
  border-radius: 32px;
  background-color: #232323;
  color: #f8faed;
  border: none;
}
</style>
