// src/store/app.js
import { defineStore } from "pinia";
export const useAppStore = defineStore("app", {
  state: () => ({
    isAppInitialized: false,
    lastRoute: localStorage.getItem("lastRoute") || "/",
  }),
  actions: {
    setLastRoute(route) {
      this.lastRoute = route;
      localStorage.setItem("lastRoute", route);
    },
  },
});
