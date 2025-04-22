import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "@/supabase/config";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Profile from "../views/Profile.vue";
import DailyProgress from "../views/DailyProgress.vue";
import WeeklyProgress from "../views/WeeklyProgress.vue";
import GoalProgress from "../views/GoalProgress.vue";
import AddActivity from "../views/Add-Activity.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/add-activity",
    name: "AddActivity",
    component: AddActivity,
    meta: { requiresAuth: true },
  },
  {
    path: "/dailyprogress",
    name: "DailyProgress",
    component: DailyProgress,
    meta: { requiresAuth: true },
  },
  {
    path: "/weeklyprogress",
    name: "WeeklyProgress",
    component: WeeklyProgress,
    meta: { requiresAuth: true },
  },
  {
    path: "/goalprogress",
    name: "GoalProgress",
    component: GoalProgress,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !user) {
    next("/login");
  } else if (
    !requiresAuth &&
    user &&
    (to.path === "/login" || to.path === "/register")
  ) {
    next("/");
  } else {
    next();
  }
});

export default router;
