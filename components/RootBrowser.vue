<script setup lang="ts">
import { ref, inject, type Ref } from "vue";
import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import GraffitiClient from "@graffiti-garden/client-core";
import {
    BTable,
    BPagination,
    type TableFieldRaw,
    type TableItem,
} from "bootstrap-vue-next";

const fetch = getDefaultSession().fetch;
const webId = getDefaultSession().info.webId;
const gf = inject<GraffitiClient>("graffiti");

interface TableKey {
    name: string;
    type: "channel" | "object";
}

type TableEntry = {
    name: string;
    lastModified: Date;
    pod: string;
} & (
    | {
          type: "channel";
          count: number;
      }
    | {
          type: "object";
      }
);

const tableEntryMap = new Map<TableKey, TableEntry>();
const tableEntries: Ref<TableItem<TableEntry>[]> = ref([]);

async function refresh() {
    for (const pod of await gf.podManager.getPods(webId, { fetch })) {
        try {
            for await (const orphan of gf.listOrphans(pod, { fetch })) {
                const key = { name: orphan.name, type: "object" } as const;
                if (orphan.tombstone) {
                    if (tableEntryMap.has(key)) {
                        tableEntryMap.delete(key);
                    }
                } else {
                    tableEntryMap.set(key, {
                        name: orphan.name,
                        lastModified: orphan.lastModified,
                        pod,
                        type: "object",
                    });
                }
            }
            for await (const channel of gf.listChannels(pod, { fetch })) {
                const key = { name: channel.channel, type: "channel" } as const;
                if (channel.count <= 0) {
                    if (tableEntryMap.has(key)) {
                        tableEntryMap.delete(key);
                    }
                } else {
                    tableEntryMap.set(key, {
                        name: channel.channel,
                        lastModified: channel.lastModified,
                        pod,
                        type: "channel",
                        count: channel.count,
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    tableEntries.value = Array.from(tableEntryMap.values());
}
refresh();

const sortFields: TableFieldRaw<TableEntry>[] = [
    { key: "type", label: "Type", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "lastModified", label: "Modified", sortable: true },
    { key: "pod", label: "Pod", sortable: true },
    { key: "count", label: "Count", sortable: true },
];

const currentPage = ref(1);
const perPage = 20;
</script>

<template>
    <BPagination
        v-model="currentPage"
        :total-rows="tableEntries.length"
        :per-page="perPage"
    />
    <BTable
        :sort-by="[
            { key: 'type', order: 'asc' },
            {
                key: 'lastModified',
                order: 'desc',
            },
        ]"
        :items="tableEntries"
        :fields="sortFields"
        :responsive="true"
        :multisort="true"
        :perPage="perPage"
        :current-page="currentPage"
    >
        <template #cell(type)="{ item }">
            {{ item.type === "channel" ? "📁 Channel" : "📄 Object" }}
        </template>
        <template #cell(name)="{ item }">
            <RouterLink
                v-if="item.type === 'object'"
                :to="`/object/${encodeURIComponent(item.pod)}/${encodeURIComponent(item.name)}`"
            >
                {{ item.name }}
            </RouterLink>
            <RouterLink
                v-else-if="item.type === 'channel'"
                :to="`/channel/${item.name}`"
                >{{ item.name }}</RouterLink
            >
        </template>
        <template #cell(lastModified)="{ item }">
            {{ item.lastModified.toLocaleString() }}
        </template>
        <template #cell(pod)="{ item }">
            <a :href="item.pod">
                {{
                    item.pod.startsWith("https://")
                        ? item.pod.slice(8)
                        : item.pod
                }}
            </a>
        </template>
    </BTable>
    <BPagination
        v-model="currentPage"
        :total-rows="tableEntries.length"
        :per-page="perPage"
    />
</template>
