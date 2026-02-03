<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'currentColor',
  },
  decorative: {
    type: Boolean,
    default: true,
  },
})

const svgName = computed(() => {
  if (props.name.includes('/')) {
    return `#${props.name}`
  } else {
    return `#/${props.name}`
  }
})

const svgStyle = computed(() => {
  return {
    fill: props.color,
    color: props.color,
  }
})
</script>

<template>
  <svg class="svg-icon" :aria-hidden="decorative" :style="svgStyle">
    <use :xlink:href="svgName" />
  </svg>
</template>

<style>
.svg-icon {
  width: 100%;
  height: 100%;
  max-width: 100px;
  max-height: 100px;
  overflow: hidden;
}
</style>
