<script setup lang="ts">
import { ref } from "vue";
import {
    login,
    getDefaultSession,
    handleIncomingRedirect,
} from "@inrupt/solid-client-authn-browser";

let loggedIn = ref(false);
(async function () {
    await handleIncomingRedirect({ restorePreviousSession: true });
    loggedIn.value = getDefaultSession().info.isLoggedIn;
})();

async function startLogin() {
    const url = new URL(window.location.toString());
    url.search = "";
    url.hash = "";
    await login({
        oidcIssuer: "https://solid.theias.place",
        redirectUrl: url.toString(),
        clientName: "Graffiti Drive",
    });
}
async function startLogout() {
    await getDefaultSession().logout();
    loggedIn.value = getDefaultSession().info.isLoggedIn;
}
</script>

<template>
    <header>
        <BNavbar>
            <BNavbarBrand to="/">My Graffiti</BNavbarBrand>
            <BNavbarNav v-if="loggedIn">
                <BNavItem v-if="$route.fullPath !== '/'" :to="$route.fullPath">
                    <span v-if="$route.fullPath.startsWith('/object')">
                        📄 {{ $route.params.name }}
                    </span>
                    <span v-else-if="$route.fullPath.startsWith('/channel')">
                        📁 {{ $route.params.channel }}
                    </span>
                    <span v-else-if="$route.fullPath.startsWith('/pods')">
                        🫛 Pods
                    </span>
                </BNavItem>
            </BNavbarNav>
            <BNavbarNav class="ml-auto">
                <BNavItem v-if="!loggedIn">
                    <BButton @click="startLogin">Login</BButton>
                </BNavItem>
                <BDropdown v-if="loggedIn" text="Menu">
                    <BDropdownItem :href="getDefaultSession().info.webId">
                        My WebID: {{ getDefaultSession().info.webId }}
                    </BDropdownItem>
                    <BDropdownItem to="/pods">
                        Manage Graffiti Pods
                    </BDropdownItem>
                    <BDropdownItem @click="startLogout">
                        Log Out
                    </BDropdownItem>
                </BDropdown>
            </BNavbarNav>
        </BNavbar>
    </header>
    <main v-if="loggedIn">
        <RouterView />
    </main>
</template>
