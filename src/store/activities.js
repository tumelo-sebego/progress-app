import { defineStore } from "pinia";
import { supabase } from "@/supabase/config";

export const useActivityStore = defineStore("activityStore", {
  state: () => ({
    activities: [],
    currentActivity: null,
    hasActiveActivity: false,
    progress: 0,
    activeElapsedTime: 0,
  }),

  getters: {
    // Get activities for a specific date
    getActivitiesByDate: (state) => (dateStr) => {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      return state.activities.filter((activity) => {
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

      return state.activities.filter((activity) => {
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

      return state.activities.filter((activity) => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= today && activityDate < tomorrow;
      });
    },

    getActivityById: (state) => (id) => {
      return state.activities.find((activity) => activity.id === id);
    },
  },

  actions: {
    prepareActivity(activity, userId) {
      return {
        ...activity,
        user_id: userId,
      };
    },

    async fetchActivities(dateRange = null) {
      try {
        if (dateRange) {
          // Filter existing activities by date range
          this.activities = this.activities.filter((activity) => {
            const activityDate = new Date(activity.created_at);
            return (
              activityDate >= dateRange.start && activityDate < dateRange.end
            );
          });
        }
        // Calculate progress with filtered or all activities
        this.calculateProgress();
      } catch (error) {
        console.error("Error filtering activities:", error.message);
      }
    },

    async fetchActivitiesForGoal(goalId) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");
        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .eq("user_id", user.id)
          .eq("goal_id", goalId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        this.activities = data;
        this.calculateProgress();
      } catch (error) {
        console.error("Error fetching activities for goal:", error.message);
      }
    },

    async addActivity(activityData) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");
        const prepared = this.prepareActivity(activityData, user.id);
        const { data, error } = await supabase
          .from("activities")
          .insert([prepared])
          .select();
        if (error) throw error;
        await this.fetchActivities();
        return data[0];
      } catch (error) {
        console.error("Error adding activity:", error.message);
        throw error;
      }
    },

    async addActivities(activitiesArray) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");
        const activitiesToInsert = activitiesArray.map((activity) =>
          this.prepareActivity(activity, user.id),
        );
        const { error } = await supabase
          .from("activities")
          .insert(activitiesToInsert);
        if (error) throw error;
        await this.fetchActivities();
      } catch (error) {
        console.error("Error adding activities:", error.message);
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
      }
    },

    setCurrentActivity(activity) {
      this.currentActivity = activity;
    },

    async startActivity(activityId) {
      try {
        this.activities.forEach((activity) => {
          if (activity.id === activityId) {
            this.currentActivity = activity;
            activity.status = "active";
            activity.startTime = new Date().toISOString();
            // Initialize activeElapsedTime with any previous duration
            this.activeElapsedTime = 0;
          }
        });
        // Set this activity to active and set timeActive
        const { error } = await supabase
          .from("activities")
          .update({
            status: "active",
            start_time: new Date().toISOString(),
          })
          .eq("id", activityId);

        if (error) throw error;

        // Update the current activity in the store
        this.hasActiveActivity = true;

        // Start interval to update activeElapsedTime every second
        if (this._activeTimer) clearInterval(this._activeTimer);
        this._activeTimer = setInterval(() => {
          this.activeElapsedTime += 1;
        }, 1000);
      } catch (error) {
        console.error("Error starting activity:", error.message);
      }
    },

    async stopActivity(activityId) {
      try {
        const activity = this.activities.find((a) => a.id === activityId);
        if (!activity) return;

        // Calculate end time based on start time + elapsed seconds
        const startTime = new Date(activity.startTime);
        const endTime = new Date(
          startTime.getTime() + this.activeElapsedTime * 1000,
        );

        // Previous duration (if any) + current session duration
        const duration = (activity.duration || 0) + this.activeElapsedTime;

        // Update local state
        activity.status = "done";
        activity.duration = duration;
        activity.endTime = endTime.toISOString();

        // Update in database
        const { error } = await supabase
          .from("activities")
          .update({
            status: "done",
            end_time: endTime.toISOString(),
            duration: duration,
          })
          .eq("id", activityId);

        if (error) throw error;

        this.hasActiveActivity = false;

        // Stop the timer
        if (this._activeTimer) {
          clearInterval(this._activeTimer);
          this._activeTimer = null;
        }
        this.activeElapsedTime = 0;
      } catch (error) {
        console.error("Error finishing activity:", error.message);
      }
    },

    calculateProgress() {
      const dailyActivities = this.getDailyActivities;
      if (dailyActivities.length === 0) {
        this.progress = 0;
        return;
      }
      const completedActivities = dailyActivities.filter(
        (activity) => activity.completed,
      ).length;
      this.progress = Math.round(
        (completedActivities / dailyActivities.length) * 100,
      );
    },
  },
});
