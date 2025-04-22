<template>
  <div>
    <h2>Register</h2>
    <form @submit.prevent="register">
      <label>Email:</label>
      <input type="email" v-model="email" required />

      <label>Password:</label>
      <input type="password" v-model="password" required />

      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script>
import { supabase } from "@/supabase/config";

export default {
  name: "Register",
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    async register() {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: this.email,
          password: this.password,
        });
        if (error) throw error;
        console.log("Registration successful", data);
        this.$router.push("/login");
      } catch (error) {
        console.error("Registration failed", error.message);
      }
    },
  },
};
</script>
