<script setup lang="ts">
import type { GraffitiObject } from "@graffiti-garden/client-core";
const props = defineProps<{
    object: GraffitiObject;
}>();
const object = props.object;
</script>
<template>
    <BCard>
        <BCardBody>
            <BCardTitle>
                <RouterLink
                    :to="`/object/${encodeURIComponent(object.pod)}/${object.name}`"
                >
                    {{ object.name }}
                </RouterLink>
            </BCardTitle>
            <BCardSubtitle>
                Last Modified: {{ object.lastModified.toLocaleString() }}
            </BCardSubtitle>
            <BCardText>
                <ul>
                    <li>Value: {{ JSON.stringify(object.value, null, 2) }}</li>
                    <li>
                        Channels:
                        <ul>
                            <li
                                v-for="channel in object.channels"
                                :key="channel"
                            >
                                <RouterLink :to="`/channel/${channel}`">{{
                                    channel
                                }}</RouterLink>
                            </li>
                        </ul>
                    </li>
                    <li>
                        Access Control:
                        <ul v-if="object?.acl">
                            <li v-for="acl in object.acl" :key="acl">
                                <RouterLink :to="`/acl/${acl}`">{{
                                    acl
                                }}</RouterLink>
                            </li>
                        </ul>
                        <span v-else>Public</span>
                    </li>
                    <li>
                        Pod:
                        <a :href="object.pod">{{ object.pod }}</a>
                    </li>
                </ul>
            </BCardText>
        </BCardBody>
    </BCard>
</template>
