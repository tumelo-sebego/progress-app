// src/store/app.js
import { defineStore } from "pinia";
import { supabase } from "@/supabase/config";

export const useAppStore = defineStore("app", {
  state: () => ({
    isAppInitialized: false,
    user: null,
    lastRoute: localStorage.getItem("lastRoute") || "/",
    session: null,
    hasInitialized: localStorage.getItem("hasInitialized") === "true",
  }),

  actions: {
    async initializeAuth() {
      try {
        // Skip if already initialized
        if (this.hasInitialized) {
          return true;
        }

        // Check for existing session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          this.session = session;
          this.user = session.user;
          this.hasInitialized = true;
          localStorage.setItem("hasInitialized", "true");
          return true;
        }

        return false;
      } catch (error) {
        console.error("Error initializing auth:", error);
        return false;
      }
    },

    setLastRoute(route) {
      this.lastRoute = route;
      localStorage.setItem("lastRoute", route);
    },

    clearAuth() {
      this.user = null;
      this.session = null;
      this.isAppInitialized = false;
      this.hasInitialized = false;
      localStorage.removeItem("hasInitialized");
    },
  },
});
