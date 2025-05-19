import { defineStore } from "pinia";
import { supabase } from "@/supabase/config";

export const useGoalSettingsStore = defineStore("goalSettings", {
  state: () => ({
    goals: [],
    activeGoal: null,
    hasActiveGoal: false,
    isInitialized: false,
  }),

  getters: {
    // Get latest goal from cached goals
    latestGoal: (state) => {
      return state.goals[0]; // goals are already ordered by created_at desc
    },

    // Get active goal from cached goals
    currentActiveGoal: (state) => {
      const today = new Date();
      return state.goals.find((goal) => {
        const endDate = new Date(goal.end_date);
        return endDate > today;
      });
    },
  },

  actions: {
    async initialize() {
      if (this.isInitialized) return;
      await this.fetchGoals();
      this.isInitialized = true;
    },

    async fetchGoals() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");

        const { data, error } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        this.goals = data;

        // Set active goal from cache
        const activeGoal = this.currentActiveGoal;
        this.setActiveGoal(activeGoal);
      } catch (error) {
        console.error("Error fetching goals:", error.message);
      }
    },

    // Modified to use cached goals
    async getLatestGoal() {
      if (!this.isInitialized) await this.initialize();
      return this.latestGoal;
    },

    // Modified to use cached goals
    async checkActiveGoal() {
      if (!this.isInitialized) await this.initialize();
      const activeGoal = this.currentActiveGoal;
      this.setActiveGoal(activeGoal);
      return activeGoal;
    },

    setActiveGoal(goal) {
      this.activeGoal = goal;
      this.hasActiveGoal = !!goal;
    },

    // Other existing actions remain the same but should call fetchGoals after mutations
    async addGoal(goalData) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");

        const { data, error } = await supabase
          .from("goals")
          .insert([{ ...goalData, user_id: user.id }])
          .select();

        if (error) throw error;
        await this.fetchGoals(); // Refresh cached goals
        return data[0];
      } catch (error) {
        console.error("Error adding goal:", error.message);
        throw error;
      }
    },

    async updateGoal(goalId, updates) {
      try {
        const { error } = await supabase
          .from("goals")
          .update(updates)
          .eq("id", goalId);

        if (error) throw error;
        await this.fetchGoals();
      } catch (error) {
        console.error("Error updating goal:", error.message);
        throw error;
      }
    },

    async deleteGoal(goalId) {
      try {
        const { error } = await supabase
          .from("goals")
          .delete()
          .eq("id", goalId);

        if (error) throw error;
        await this.fetchGoals();
      } catch (error) {
        console.error("Error deleting goal:", error.message);
        throw error;
      }
    },

    async getLatestActiveGoal() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .gte("end_date", today)
        .order("end_date", { ascending: true });
      if (error || !data || data.length === 0) return null;
      // Get the goal with the soonest end_date in the future
      return data[0];
    },
  },
});
