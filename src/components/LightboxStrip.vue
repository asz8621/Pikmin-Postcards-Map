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
</script>

<template>
  <div class="modeText">{{ modeText }}</div>
  <n-space
    class="lightbox"
    justify="start"
    align="center"
    size="small"
    :item-class="mapData.length > 0 ? 'lightboxItem' : 'lightboxItemEmpty'"
  >
    <n-image
      v-for="item in mapData"
      :key="item.id"
      :src="item.image"
      width="64"
      preview-disabled
      @click="openModal('postcard', item)"
    />
    <div v-if="mapData.length < 1" class="emptyText">附近沒有好看的景點</div>
  </n-space>
</template>

<style lang="scss">
.lightbox {
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 0.5rem;
  display: flex;
  width: 100%;
  height: 100px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0 0.5rem 0 0;
  z-index: 3;
  .lightboxItem {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  .lightboxItemEmpty {
    text-align: center;
    width: 100%;
    color: #fff;
    cursor: default;
  }
}
.modeText {
  position: absolute;
  bottom: 100px;
  left: 0rem;
  background: rgba(0, 0, 0, 0.5);
  padding: 0.25rem 0.75rem 0.25rem 0.5rem;
  border-radius: 0.5rem 0.5rem 0 0;
  color: #fff;
  z-index: 2;
}
</style>
