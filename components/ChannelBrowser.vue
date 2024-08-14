<script setup lang="ts">
import { reactive, ref, watch, computed, inject } from "vue";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import GraffitiClient from "@graffiti-garden/client-core";
import { useRoute } from "vue-router";
import ObjectDisplay from "./ObjectDisplay.vue";

const graffitiPod = "https://pod.graffiti.garden";
const gf = inject<GraffitiClient>("graffiti");
const fetch = getDefaultSession().fetch;
const webId = getDefaultSession().info.webId;

const route = useRoute();
const channel = ref("");
const objects = reactive(new Map<string, any>());
watch(
    () => route.params.channel,
    async (newChannel) => {
        if (Array.isArray(newChannel)) return;
        channel.value = newChannel;
        objects.clear();

        const iterator = gf.query([newChannel], {
            pods: [graffitiPod],
            fetch,
        });

        for await (const result of iterator) {
            if (result.error == true) {
                console.error(result.message);
            } else {
                const object = result.value;
                if (object.tombstone) {
                    objects.delete(object.name);
                } else {
                    objects.set(object.name, object);
                }
            }
        }
    },
    {
        immediate: true,
    },
);
</script>

<template>
    <ul>
        <li v-for="object in objects.values()">
            <ObjectDisplay :object="object" />
        </li>
    </ul>
</template>
