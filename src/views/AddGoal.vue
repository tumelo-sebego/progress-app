<template>
  <div class="page-container">
    <Header />
    <div class="content-container">
      <h1 class="greeting-title">Ola, {{ userName }}</h1>
      <div class="no-goals-card">
        <p class="no-goals-text">You have no goals currently setup</p>
      </div>
    </div>
    <Navbar />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/supabase/config";
import Header from "../components/Header.vue";
import Navbar from "../components/Navbar.vue";

const userName = ref("");

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.user_metadata?.full_name) {
    userName.value = user.user_metadata.full_name;
  }
});
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
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem;
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
}

.no-goals-text {
  color: #232323;
  font-size: 1.125rem;
  font-weight: 500;
}
</style>
