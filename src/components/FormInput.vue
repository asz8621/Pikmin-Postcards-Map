<script setup>
defineProps({
  modelValue: String,
  path: String,
  type: {
    type: String,
    default: 'text',
  },
  placeholder: String,
  icon: String,
  showPasswordOn: String,
})

defineEmits(['update:modelValue', 'input'])
</script>

<template>
  <n-form-item :path="path" :show-label="false">
    <n-input
      :value="modelValue"
      @update:value="$emit('update:modelValue', $event)"
      :type="type"
      :placeholder="placeholder"
      :show-password-on="showPasswordOn"
      @input="$emit('input', $event)"
    >
      <template #prefix>
        <div class="size-5 mr-2">
          <SvgIcon :name="icon" color="#D3A452" />
        </div>
      </template>
    </n-input>
  </n-form-item>
</template>

<style lang="scss" scoped></style>
