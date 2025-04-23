<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useGoalSettingsStore } from "@/store/goalSettings";

const router = useRouter();
const route = useRoute();
const goalStore = useGoalSettingsStore();

// State to track the active tab and active goal
const activeTab = ref("");
const activeGoal = ref("");
const isGoalsMenuOpen = ref(false);
const isGoalsMenuVisible = ref(false);
const isClosingSubmenu = ref(false);

// Tabs for the main navigation
const tabs = computed(() => {
  const baseTabs = [
    { id: "home", icon: "home", text: "Home" },
    { id: "calendar", icon: "calendar_today", text: "Goals" },
    { id: "profile", icon: "person", text: "Profile" },
  ];

  if (!goalStore.hasActiveGoal) {
    baseTabs.unshift({ id: "add-goal", icon: "add", text: "Add Goal" });
  }

  return baseTabs;
});

// Function to determine if a tab is active
function isTabActive(tabId) {
  if (tabId === "calendar") {
    return isGoalsMenuOpen.value || route.path.includes("progress");
  }
  if (tabId === "add-goal") {
    return route.path === "/add-goal";
  }
  return activeTab.value === tabId && !isGoalsMenuOpen.value;
}

// Function to handle navigation for main tabs
function navigateToTab(tabId) {
  if (tabId === "add-goal") {
    closeGoalsMenu();
    activeTab.value = tabId;
    router.push("/add-goal");
    return;
  }

  if (tabId === "calendar") {
    // ...existing code...
  } else {
    // ...existing code...
  }
}

// ...existing code...
</script>