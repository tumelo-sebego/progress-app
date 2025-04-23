import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import "./registerServiceWorker";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import "./assets/main.css";
import "./assets/globals.css";
import "primeicons/primeicons.css";
import { supabase } from "./supabase/config";

// Initialize Supabase auth state
supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_IN") {
    router.push("/"); // Redirect to home when signed in
  } else if (event === "SIGNED_OUT") {
    router.push("/login"); // Redirect to login when signed out
  }
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      cssLayer: false,
    },
  },
});
app.use(router);
app.mount("#app");
