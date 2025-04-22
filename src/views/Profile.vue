<template>
  <div class="page-container">
    <Header />
    <div class="content-container">
      <h1 class="page-title">Profile</h1>
      <div v-if="user" class="profile-info">
        <p>Email: {{ user.email }}</p>
        <button @click="handleLogout" class="logout-button">Logout</button>
      </div>
    </div>
    <Navbar />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/supabase/config";
import Header from "../components/Header.vue";
import Navbar from "../components/Navbar.vue";

const router = useRouter();
const user = ref(null);

onMounted(async () => {
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  user.value = currentUser;
});

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push("/login");
  } catch (error) {
    console.error("Error logging out:", error.message);
  }
};
</script>

<style scoped>
/* Mimic the layout of the home page */
.page-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.page-description {
  font-size: 1rem;
  color: #555;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.logout-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
}

.logout-button:hover {
  background-color: #c82333;
}
</style>
