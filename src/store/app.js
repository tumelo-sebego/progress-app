// src/store/app.js
import { defineStore } from "pinia";
export const useAppStore = defineStore("app", {
  state: () => ({
    isAppInitialized: false,
    user: null,
  }),
});
