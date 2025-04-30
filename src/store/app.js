// src/store/app.js
import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    isAppInitialized: false,
    lastRoute: localStorage.getItem("lastRoute") || "/",
    user: null,
  }),

  actions: {
    setLastRoute(route) {
      if (route && route !== "/login" && route !== "/register") {
        this.lastRoute = route;
        localStorage.setItem("lastRoute", route);
      }
    },

    clearLastRoute() {
      this.lastRoute = "/";
      localStorage.removeItem("lastRoute");
    },
  },
});
