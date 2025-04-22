import { defineStore } from "pinia";
import { supabase } from "@/supabase/config";

export const useActivityStore = defineStore("activityStore", {
  state: () => ({
    activities: [],
    currentActivity: null,
    progress: 0,
  }),

  getters: {
    // Get activities for a specific date
    getActivitiesByDate: (state) => (dateStr) => {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      return state.activities.filter(activity => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= date && activityDate < nextDay;
      });
    },

    // Get activities for current week
    getWeeklyActivities: (state) => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      return state.activities.filter(activity => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= startOfWeek && activityDate < endOfWeek;
      });
    },

    // Get today's activities
    getDailyActivities: (state) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      return state.activities.filter(activity => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= today && activityDate < tomorrow;
      });
    }
  },

  actions: {
    async fetchActivities(dateRange = null) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        let query = supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id);

        if (dateRange) {
          query = query
            .gte('created_at', dateRange.start.toISOString())
            .lt('created_at', dateRange.end.toISOString());
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        this.activities = data;
        this.calculateProgress();
      } catch (error) {
        console.error('Error fetching activities:', error.message);
      }
    },

    async addActivity(activityData) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { data, error } = await supabase
          .from('activities')
          .insert([{
            ...activityData,
            user_id: user.id,
            completed: false,
            created_at: new Date().toISOString()
          }])
          .select();

        if (error) throw error;
        await this.fetchActivities();
        return data[0];
      } catch (error) {
        console.error('Error adding activity:', error.message);
        throw error;
      }
    },

    async updateActivity(id, updates) {
      try {
        const { error } = await supabase
          .from("activities")
          .update(updates)
          .eq("id", id);

        if (error) throw error;
        await this.fetchActivities();
      } catch (error) {
        console.error("Error updating activity:", error.message);
        throw error;
      }
    },

    async completeActivity(id) {
      try {
        const { error } = await supabase
          .from("activities")
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;
        await this.fetchActivities();
      } catch (error) {
        console.error("Error completing activity:", error.message);
        throw error;
      }
    },

    async deleteActivity(id) {
      try {
        const { error } = await supabase
          .from("activities")
          .delete()
          .eq("id", id);

        if (error) throw error;
        await this.fetchActivities();
      } catch (error) {
        console.error("Error deleting activity:", error.message);
        throw error;
      }
    },

    setCurrentActivity(activity) {
      this.currentActivity = activity;
    },

    calculateProgress() {
      const dailyActivities = this.getDailyActivities;
      if (dailyActivities.length === 0) {
        this.progress = 0;
        return;
      }
      const completedActivities = dailyActivities.filter(activity => activity.completed).length;
      this.progress = Math.round((completedActivities / dailyActivities.length) * 100);
    }
  }
});
