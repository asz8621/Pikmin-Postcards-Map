<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
})

const svgName = computed(() => {
  if (props.name.includes('/')) {
    return `#${props.name}`
  } else {
    return `#/${props.name}`
  }
})
</script>

<template>
  <svg class="svg-icon" aria-hidden="true">
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
