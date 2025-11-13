<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
import { ref } from "vue";
import type { CoreAgentUIMessage } from '@/agents/core-agent';

const input = ref("");
const chat = new Chat<CoreAgentUIMessage>({});

const handleSubmit = (e: Event) => {
    e.preventDefault();
    chat.sendMessage({ text: input.value });
    input.value = "";
};
</script>

<template>
    <div>
        <div v-for="(m, index) in chat.messages" :key="m.id ? m.id : index">
            {{ m.role === "user" ? "User: " : "AI: " }}
            <div
                v-for="(part, index) in m.parts"
                :key="`${m.id}-${part.type}-${index}`"
            >
                <div v-if="part.type === 'text'">{{ part.text }}</div>
                <pre
                    v-if="
                        part.type === 'tool-weather' ||
                        part.type === 'tool-convertFahrenheitToCelsius'
                    "
                    >{{ JSON.stringify(part, null, 2) }}</pre
                >
            </div>
        </div>

        <form @submit="handleSubmit">
            <input v-model="input" placeholder="Say something..." />
        </form>
    </div>
</template>