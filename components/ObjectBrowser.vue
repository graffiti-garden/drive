<script setup lang="ts">
import { ref, watch, inject } from "vue";
import { useRoute } from "vue-router";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import GraffitiClient from "@graffiti-garden/client-core";
import type { GraffitiObject } from "@graffiti-garden/client-core";
import ObjectDisplay from "./ObjectDisplay.vue";

const gf = inject<GraffitiClient>("graffiti");
const fetch = getDefaultSession().fetch;
const webId = getDefaultSession().info.webId;

const route = useRoute();

const name = ref("");
const pod = ref("");
const object = ref<GraffitiObject | null>(null);
const error = ref<string | null>(null);
watch(
    () => ({
        name: route.params.name,
        pod: route.params.pod,
    }),
    async (change) => {
        if (Array.isArray(change.name) || Array.isArray(change.pod)) return;
        name.value = change.name;
        pod.value = change.pod;

        try {
            object.value = await gf.get(
                {
                    name: change.name,
                    webId,
                    pod: change.pod,
                },
                {
                    fetch,
                },
            );
            error.value = null;
        } catch (e) {
            error.value = e.message;
        }
    },
    {
        immediate: true,
    },
);
</script>

<template>
    <div v-if="error">
        {{ error }}
    </div>
    <template v-else>
        <ObjectDisplay v-if="object" :object="object" />
    </template>
</template>
