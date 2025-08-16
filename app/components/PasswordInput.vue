<script setup lang="ts">
interface Props {
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  name?: string;
}

const model = defineModel<string>();

defineProps<Props>();

const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <UInput
    v-model="model"
    :type="showPassword ? 'text' : 'password'"
    :placeholder="placeholder"
    icon="i-lucide-key"
    :disabled="disabled"
    :size="size"
    :name="name"
  >
    <template #trailing>
      <UButton
        type="button"
        color="neutral"
        variant="link"
        :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        class="h-auto p-0"
        @click="togglePasswordVisibility"
      />
    </template>
  </UInput>
</template>
