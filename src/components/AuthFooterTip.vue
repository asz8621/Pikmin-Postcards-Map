<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  tipText: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    required: true,
  },
  routeTo: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const handleClick = () => {
  router.push(props.routeTo)
}
</script>

<template>
  <div class="flex justify-center items-center">
    <span class="text-gray-600">{{ tipText }}</span>
    <n-button type="text" size="small" :disabled="loading" @click="handleClick">
      {{ buttonText }}
    </n-button>
  </div>
</template>

<style lang="scss" scoped></style>
