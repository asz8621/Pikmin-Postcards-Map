<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMapStore } from '@/stores/map'
import { useModalStore } from '@/stores/modal'

const mapStore = useMapStore()
const { mapData, isFiltered } = storeToRefs(mapStore)

const modalStore = useModalStore()
const { openModal } = modalStore

const modeText = computed(() => {
  return isFiltered.value ? '篩選模式' : '一般模式'
})

const notFoundText = computed(() => {
  return isFiltered.value ? '篩選不到任何的景點，請放寬標準' : '附近沒有好看的景點'
})
</script>

<template>
  <div class="absolute bottom-[100px] left-0 bg-black/50 px-2 py-1.5 rounded-t-lg text-white z-[2]">
    {{ modeText }}
  </div>

  <div
    class="absolute bottom-0 left-0 w-full h-[100px] bg-black/50 p-2 z-[3] rounded-tr-lg overflow-x-auto flex flex-nowrap items-center space-x-2 touch-pan-x"
    style="-webkit-overflow-scrolling: touch"
  >
    <template v-if="mapData.length > 0">
      <n-image
        v-for="item in mapData"
        :key="item.id"
        :src="item.image"
        width="64"
        preview-disabled
        class="inline-block min-w-[64px] cursor-pointer hover:opacity-80 transition"
        @click="openModal('postcard', item)"
      />
    </template>

    <div v-else class="text-center w-full text-white cursor-default">{{ notFoundText }}</div>
  </div>
</template>

<style lang="scss"></style>
