<script setup>
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMapStore } from '@/stores/useMapStore'
import { useModalStore } from '@/stores/useModalStore'

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

// 紀錄已成功載入的圖片 URL，避免重複預載
const loadedImages = ref(new Set())

// ✅ 加入圖片預載邏輯
watch(mapData, (items) => {
  for (const item of items) {
    if (!loadedImages.value.has(item.image)) {
      const img = new Image()
      // 載入完成時加入快取 Set
      img.onload = () => loadedImages.value.add(item.image)
      // 指定圖片來源開始載入
      img.src = item.image
    }
  }
})

// 切換 Skeleton 與圖片顯示
const isLoaded = (url) => loadedImages.value.has(url)
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
      <div
        v-for="item in mapData"
        :key="item.id"
        class="inline-block min-w-[64px] h-[64px] relative"
      >
        <!-- Skeleton：圖片尚未載入時顯示 -->
        <div
          v-show="!isLoaded(item.image)"
          class="w-full h-full bg-gray-300 animate-pulse rounded object-cover"
        ></div>

        <!-- 圖片載入成功後顯示 -->
        <n-image
          v-show="isLoaded(item.image)"
          :src="item.image"
          width="64"
          preview-disabled
          class="absolute top-0 left-0 w-full h-full object-cover cursor-pointer hover:opacity-80 transition"
          fallback-src="/img-error.png"
          @click="openModal('postcard', item)"
        />
      </div>
    </template>

    <div v-else class="text-center w-full text-white cursor-default">{{ notFoundText }}</div>
  </div>
</template>

<style lang="scss"></style>
