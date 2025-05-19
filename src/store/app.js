// src/store/app.js
import { defineStore } from "pinia";
import { supabase } from "@/supabase/config";

export const useAppStore = defineStore("app", {
  state: () => ({
    isAppInitialized: false,
    user: null,
    lastRoute: localStorage.getItem("lastRoute") || "/",
    session: null,
  }),

  actions: {
    async initializeAuth() {
      try {
        // Check for existing session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          this.session = session;
          this.user = session.user;
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
    },
  },
});
