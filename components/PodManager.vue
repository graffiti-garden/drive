<script setup lang="ts">
import { inject, ref, reactive } from "vue";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import GraffitiClient from "@graffiti-garden/client-core";

const fetch = getDefaultSession().fetch;
const webId = getDefaultSession().info.webId;
const gf = inject<GraffitiClient>("graffiti");
const podManager = gf.podManager;

const pods = ref<string[]>([]);
async function refresh() {
    pods.value = await podManager.getPods(webId, { fetch });
}
refresh();

const loadingRemove = reactive(new Set<string>());
async function removePod(pod: string) {
    loadingRemove.add(pod);
    try {
        await podManager.removePod(webId, pod, { fetch });
    } catch (e) {
        return alert(e);
    } finally {
        loadingRemove.delete(pod);
    }
    refresh();
}

const loadingAdd = ref(false);
const newPod = ref<string>("");
async function addPod() {
    if (!newPod.value) return;
    loadingAdd.value = true;
    try {
        await podManager.addPod(webId, newPod.value, { fetch });
    } catch (e) {
        return alert(e);
    } finally {
        loadingAdd.value = false;
    }
    newPod.value = "";
    refresh();
}
</script>

<template>
    <p>These are pods that you have delegated to host your Graffiti.</p>
    <ul>
        <li v-for="pod in pods" :key="pod">
            <a :href="pod" target="_blank">{{ pod }}</a>
            <BButton
                variant="danger"
                v-if="!loadingRemove.has(pod)"
                @click="removePod(pod)"
                >Remove</BButton
            >
            <BButton variant="success" v-else disabled>
                <BSpinner small />
            </BButton>
        </li>
        <li>
            <BForm @submit="addPod">
                <BInputGroup>
                    <BFormInput v-model="newPod" />
                    <template #append>
                        <BButton
                            variant="primary"
                            v-if="!loadingAdd"
                            @click="addPod"
                            >Add</BButton
                        >
                        <BButton variant="success" v-else disabled>
                            <BSpinner small />
                        </BButton>
                    </template>
                </BInputGroup>
            </BForm>
        </li>
    </ul>
</template>
