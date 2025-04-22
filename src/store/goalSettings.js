import { defineStore } from 'pinia';
import { supabase } from '@/supabase/config';

export const useGoalSettingsStore = defineStore('goalSettings', {
  state: () => ({
    goals: [],
    currentGoal: null
  }),

  actions: {
    async fetchGoals() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        this.goals = data;
      } catch (error) {
        console.error('Error fetching goals:', error.message);
      }
    },

    async addGoal(goalData) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { data, error } = await supabase
          .from('goals')
          .insert([{ ...goalData, user_id: user.id }])
          .select();

        if (error) throw error;
        await this.fetchGoals();
        return data[0];
      } catch (error) {
        console.error('Error adding goal:', error.message);
        throw error;
      }
    },

    async updateGoal(goalId, updates) {
      try {
        const { error } = await supabase
          .from('goals')
          .update(updates)
          .eq('id', goalId);

        if (error) throw error;
        await this.fetchGoals();
      } catch (error) {
        console.error('Error updating goal:', error.message);
        throw error;
      }
    },

    async deleteGoal(goalId) {
      try {
        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', goalId);

        if (error) throw error;
        await this.fetchGoals();
      } catch (error) {
        console.error('Error deleting goal:', error.message);
        throw error;
      }
    },

    setCurrentGoal(goal) {
      this.currentGoal = goal;
    }
  }
});
