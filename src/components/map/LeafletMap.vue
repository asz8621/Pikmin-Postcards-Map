<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useMapStore } from '@/stores/useMapStore'
import { useInfoStore } from '@/stores/useInfoStore'
import { useSocketEvents } from '@/composables/useSocketEvents'
import { useLeafletMap } from '@/composables/useLeafletMap'
import { useMapFilter } from '@/composables/useMapFilter'
import FilterDrawer from '@/components/map/FilterDrawer.vue'

const mapStore = useMapStore()
const { isFiltered } = storeToRefs(mapStore)
const { refreshMapView } = mapStore

const infoStore = useInfoStore()
const { userData } = storeToRefs(infoStore)

const { handlePostcardType, handleLocation, useSocketListener, joinRoom } = useSocketEvents()

const { initMap, currentLocation, cleanupMap, isLocating } = useLeafletMap({
  containerId: 'map',
})

const { openFilterDrawer } = useMapFilter()

// 類型 socket 處理
const handlePostcardTypeSocket = (socketData) => {
  handlePostcardType(socketData)
}

// 點位 socket 處理
const handleLocationSocket = (socketData) => {
  // 資料處理
  handleLocation(socketData)

  // 地圖更新
  refreshMapView()
}

// 註冊 Socket 事件監聽器
useSocketListener('postcardType', handlePostcardTypeSocket)
useSocketListener('location', handleLocationSocket)

onMounted(() => {
  initMap()
  joinRoom('map', userData.value?.id || null)
})

onBeforeUnmount(() => {
  cleanupMap()
})
</script>

<template>
  <div id="map" class="select-none touch-none"></div>

  <!-- 我的位置 Icon -->
  <div class="mapIcon locationIcon" :class="{ locating: isLocating }" @click="currentLocation">
    <SvgIcon name="location" />
  </div>

  <!-- 篩選抽屜 Icon -->
  <div class="mapIcon drawerIcon" :class="{ filtered: isFiltered }" @click="openFilterDrawer">
    <SvgIcon name="filter" />
  </div>

  <FilterDrawer />
</template>

<style lang="scss">
#map {
  width: 100%;
  height: 100%;
}

.leaflet-bar.leaflet-control {
  margin: 0;
  position: absolute;
  bottom: 110px;
  right: 1rem;
  border: 1px solid #ccc;
  overflow: hidden;
}

.mapIcon {
  width: 32px;
  height: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
  position: absolute;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fff;
  padding: 0.25rem;
  cursor: pointer;
  z-index: 1000;
  &:hover {
    background: #f4f4f4;
  }
  &.locationIcon {
    bottom: 180px;
    &.locating {
      cursor: not-allowed;
      color: #d3a452;
      .svg-icon {
        animation: pulse 1.5s ease-in-out infinite;
      }
    }
  }
  &.drawerIcon {
    bottom: 218px;
    &.filtered {
      background: #807bff;
      color: #fff;
    }
  }
}

// 定位中的動畫
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}
</style>
