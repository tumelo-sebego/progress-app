<template>
  <div class="phone-frame">
    <div class="login-container">
      <Card class="p-shadow-3">
        <template #title>
          <span class="login-title">Login</span>
        </template>
        <template #content>
          <form @submit.prevent="login" class="p-fluid">
            <FloatLabel>
              <InputText
                id="email"
                v-model="email"
                class="dark-text"
                required />
              <label for="email">Email</label>
            </FloatLabel>

            <FloatLabel class="p-mt-3">
              <Password
                id="password"
                v-model="password"
                toggleMask
                class="dark-text"
                required />
              <label for="password">Password</label>
            </FloatLabel>

            <Button
              label="Login"
              icon="pi pi-sign-in"
              class="p-mt-3"
              type="submit" />
          </form>
          <p class="p-mt-3 forgot-password">
            <router-link to="/forgot-password" class="link">
              Forgot Password?
            </router-link>
          </p>
          <router-link to="/register" custom v-slot="{ navigate }">
            <Button
              label="Register"
              class="p-button-secondary"
              @click="navigate" />
          </router-link>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase/config";
import Card from "primevue/card";
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
.phone-frame {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: rgb(250 251 231);
}

.login-container {
  width: 90%;
  max-width: 400px;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: #232323;
}

:deep(.p-inputtext) {
  background-color: #eaeed3;
}

:deep(.p-password-input) {
  background-color: #eaeed3;
}

.dark-text {
  color: #232323;
}

.forgot-password {
  text-align: center;
}

.link {
  color: #50a65d;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

:deep(.p-card) {
  background-color: rgb(250 251 231);
  border-radius: 1rem;
}
</style>
