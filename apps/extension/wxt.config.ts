import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// One codebase, two browsers: `wxt build` emits Chrome MV3, `wxt build -b
// firefox` emits the Firefox build, both under .output/.
export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/i18n/module"],
  manifest: {
    // Localized via @wxt-dev/i18n from locales/*.yml -> generated _locales.
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
    permissions: [],
    host_permissions: ["http://localhost:3000/*"],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
