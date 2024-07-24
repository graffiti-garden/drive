import { createApp } from "vue";
import { createWebHashHistory, createRouter } from "vue-router";
import { createBootstrap } from "bootstrap-vue-next";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
import GraffitiClient from "@graffiti-garden/client-core";
import App from "./components/App.vue";
import RootBrowser from "./components/RootBrowser.vue";
import ChannelBrowser from "./components/ChannelBrowser.vue";
import ObjectBrowser from "./components/ObjectBrowser.vue";
import PodManager from "./components/PodManager.vue";

const routes = [
  { path: "/", component: RootBrowser },
  { path: "/channel/:channel", component: ChannelBrowser },
  { path: "/object/:pod/:name", component: ObjectBrowser },
  { path: "/pods", component: PodManager },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

const graffiti = new GraffitiClient();
const app = createApp(App);
app.config.globalProperties.$graffiti = graffiti;
app.provide("graffiti", graffiti);
app.use(router).use(createBootstrap()).mount("#app");
