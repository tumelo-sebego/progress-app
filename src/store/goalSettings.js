import { defineStore } from "pinia";
import { supabase } from "@/supabase/config";

export const useGoalSettingsStore = defineStore("goalSettings", {
  state: () => ({
    goals: [],
    currentGoal: null,
    hasActiveGoal: false,
  }),

  actions: {
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
      } catch (error) {
        console.error("Error fetching goals:", error.message);
      }
    },

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
        await this.fetchGoals();
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

    async checkActiveGoal() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");

        const currentDate = new Date().toISOString();
        const { data, error } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .gt("end_date", currentDate)
          .single();

        if (error && error.code !== "PGRST116") throw error; // PGRST116 is the "no rows returned" error code

        this.hasActiveGoal = !!data;
        return data;
      } catch (error) {
        console.error("Error checking active goal:", error.message);
        return null;
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

    setCurrentGoal(goal) {
      this.currentGoal = goal;
    },
  },
});
