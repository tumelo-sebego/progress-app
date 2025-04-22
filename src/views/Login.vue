<template>
  <div class="login-page">
    <h1 class="app-title">Progress App</h1>

    <div class="login-section">
      <h2 class="login-header">Login</h2>

      <form @submit.prevent="login" class="login-form">
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

        <Button label="Login" type="submit" class="login-button" />

        <router-link to="/register" custom v-slot="{ navigate }">
          <Button label="Sign up" class="signup-button" @click="navigate" />
        </router-link>

        <div class="forgot-section">
          <router-link to="/forgot-password" class="forgot-link">
            Forgot Password?
          </router-link>
        </div>
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

async function login() {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    router.push("/");
  } catch (error) {
    console.error("Login failed", error.message);
  }
}
</script>

<style scoped>
.login-page {
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

.login-section {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.login-header {
  color: #232323;
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  text-align: left;
}

.login-form {
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
  color: #232323 !important;
}

:deep(.p-button-label) {
  color: #fafbe7;
}

.login-button {
  width: 100%;
  border-radius: 32px;
  margin-top: 1rem;
  background-color: #50a65d;
}

.signup-button {
  width: 100%;
  border-radius: 32px;
  background-color: #232323;
  border: none;
  color: #f8faed;
}

.forgot-section {
  text-align: center;
}

.forgot-link {
  color: #232323;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

:deep(.p-floatlabel .p-floatlabel-over .input-group) {
  margin-bottom: 1rem;
}
</style>
