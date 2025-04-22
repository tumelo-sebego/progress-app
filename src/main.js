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

// import "@primeuix/themes/aura/theme.css";

const app = createApp(App);
app.use(PrimeVue, {
  // Default theme configuration
  theme: {
    preset: Aura,
    options: {
      prefix: "p",
      cssLayer: false,
    },
  },
});
app.use(router);
app.use(createPinia());
app.mount("#app");
