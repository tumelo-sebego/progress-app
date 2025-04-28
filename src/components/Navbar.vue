<template>
  <div class="nav-wrapper">
    <div class="bottom-nav">
      <!-- Goals Submenu -->
      <div
        v-if="isGoalsMenuVisible"
        :class="['goals-submenu', { 'slide-down': isClosingSubmenu }]"
        @animationend="handleAnimationEnd">
        <button
          v-for="item in goalItems"
          :key="item.id"
          @click.stop="navigateToGoal(item.id)"
          class="nav-button"
          :class="{
            'active-tab': activeGoal === item.id,
            'active-view': isGoalViewActive(item.id),
          }">
          <span class="material-icons icon-spacing">{{ item.icon }}</span>
          <span class="nav-text">{{ item.text }}</span>
        </button>
      </div>

      <div class="nav-container">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click.stop="navigateToTab(tab.id)"
          class="nav-button"
          :class="{ 'active-tab': isTabActive(tab.id) }">
          <span v-if="isTabActive(tab.id)" class="nav-text">{{
            tab.text
          }}</span>
          <span v-else class="material-icons">{{ tab.icon }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useGoalSettingsStore } from "@/store/goalSettings";

const router = useRouter();
const route = useRoute();
const goalStore = useGoalSettingsStore();

// State to track the active tab and active goal
const activeTab = ref(""); // Default to no active tab
const activeGoal = ref(""); // Default to no active goal
const isGoalsMenuOpen = ref(false); // Tracks if the submenu is logically open
const isGoalsMenuVisible = ref(false); // Tracks if the submenu is visible (for animation)
const isClosingSubmenu = ref(false); // Tracks if the submenu is animating down

// Tabs for the main navigation with computed property
const tabs = computed(() => {
  const baseTabs = [
    { id: "calendar", icon: "calendar_today", text: "Goals" },
    { id: "profile", icon: "person", text: "Profile" },
  ];

  // Add either home or add-goal as the first tab
  if (goalStore.hasActiveGoal) {
    baseTabs.unshift({ id: "home", icon: "home", text: "Home" });
  } else {
    baseTabs.unshift({ id: "add-goal", icon: "add", text: "Add Goal" });
  }

  return baseTabs;
});

// Submenu items for the "Goals" tab
const goalItems = ref([
  { id: "daily", icon: "bolt", text: "Daily Progress" },
  { id: "weekly", icon: "star", text: "Weekly Progress" },
  { id: "goal", icon: "emoji_events", text: "Goal Progress" },
]);

// Function to determine if a tab is active
function isTabActive(tabId) {
  if (tabId === "calendar") {
    // The "Goals" tab is active if the submenu is open or a goal view is displayed
    return isGoalsMenuOpen.value || route.path.includes("progress");
  }
  return activeTab.value === tabId && !isGoalsMenuOpen.value;
}

// Function to handle navigation for main tabs
function navigateToTab(tabId) {
  if (tabId === "add-goal") {
    // Close any open menus and navigate to add goal
    closeGoalsMenu();
    activeTab.value = tabId;
    router.push("/add-goal");
    return;
  }

  if (tabId === "calendar") {
    // Prevent any action if animation is in progress
    if (isClosingSubmenu.value) {
      return;
    }

    // Toggle menu state
    if (isGoalsMenuOpen.value) {
      closeGoalsMenu();
    } else {
      openGoalsMenu();
      activeTab.value = "calendar";
    }
  } else {
    closeGoalsMenu();
    activeTab.value = tabId;
    router.push(`/${tabId === "home" ? "" : tabId}`);
  }
}

// Function to handle navigation for goal submenu items
function navigateToGoal(goalId) {
  // Set the active goal and navigate to the corresponding view
  activeGoal.value = goalId;
  closeGoalsMenu();
  activeTab.value = "calendar"; // Keep "Goals" tab active
  router.push(`/${goalId}progress`);
}

// Function to open the Goals submenu
function openGoalsMenu() {
  if (isClosingSubmenu.value || isGoalsMenuOpen.value) {
    return;
  }
  isGoalsMenuOpen.value = true;
  isGoalsMenuVisible.value = true;
}

// Function to close the Goals submenu
function closeGoalsMenu() {
  if (!isGoalsMenuOpen.value || isClosingSubmenu.value) {
    return;
  }
  isClosingSubmenu.value = true;
  // isGoalsMenuOpen and isGoalsMenuVisible will be updated after animation ends
}

// Handle the end of the animation
function handleAnimationEnd() {
  if (isClosingSubmenu.value) {
    isGoalsMenuVisible.value = false;
    isClosingSubmenu.value = false;
    isGoalsMenuOpen.value = false;

    // Only update the active tab if we're not on a progress view
    if (!route.path.includes("progress")) {
      if (route.path === "/") {
        activeTab.value = "home";
      } else {
        activeTab.value = route.path.replace("/", "");
      }
    }
  }
}

// Initialize the active tab based on the current route
onMounted(() => {
  if (route.path === "/") {
    activeTab.value = "home"; // Default to "Home" tab
  } else if (route.path.includes("progress")) {
    activeTab.value = "calendar"; // Default to "Goals" tab if a submenu view is active
  } else {
    activeTab.value = route.path.replace("/", ""); // Set the active tab based on the route
  }
});

// Close the submenu when clicking outside
function handleClickOutside(event) {
  const navWrapper = document.querySelector(".nav-wrapper");
  if (navWrapper && !navWrapper.contains(event.target)) {
    closeGoalsMenu();
  }
}

// Add and remove event listeners for clicks outside the menu
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Function to determine if a goal view is active
function isGoalViewActive(goalId) {
  return route.path.includes(`${goalId}progress`);
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

.nav-wrapper {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 1rem;
}

.bottom-nav {
  background-color: #232323;
  padding: 0.25rem;
  border-radius: 9999px;
  width: 20rem;
  z-index: 10;
  position: relative;
  display: block;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  max-width: 28rem;
}

.goals-submenu {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  animation: slideUpItem 0.3s ease-out forwards;
}

.goals-submenu.slide-down {
  animation: slideDownItem 0.3s ease-out forwards;
}

.goals-submenu .nav-button {
  background-color: #e6e7e9;
  border: 2px solid #232323;
  border-radius: 9999px;
  padding: 0.25rem;
  color: #f1f3e6;
}

.goals-submenu .material-icons {
  color: #232323;
}
.goals-submenu .nav-button.active-tab {
  background-color: #50a65d;
  color: #232323;
}

.goals-submenu .nav-button.active-view {
  background-color: #81c784;
  color: #232323;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 2.5rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  color: white;
  padding: 0 1.5rem;
  background: transparent;
}

.nav-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.active-tab {
  background-color: #50a65d;
  color: #232323;
}

.material-icons {
  font-size: 1.5rem;
  color: #f1f3e6;
}

.icon-spacing {
  margin-right: 0.5rem;
}

.active-tab .material-icons {
  color: #232323;
}

@keyframes slideUpItem {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDownItem {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
}
</style>
