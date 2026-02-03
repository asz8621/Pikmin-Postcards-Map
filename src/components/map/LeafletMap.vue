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
const { refreshMapView, zoomIn, zoomOut } = mapStore

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
  <n-popover placement="left" trigger="hover" class="responsivePopover">
    <template #trigger>
      <div class="mapIcon locationIcon" :class="{ locating: isLocating }" @click="currentLocation">
        <SvgIcon name="location" />
      </div>
    </template>
    <div class="large-text">我的位置</div>
  </n-popover>

  <!-- 篩選抽屜 Icon -->
  <n-popover placement="left" trigger="hover" class="responsivePopover">
    <template #trigger>
      <div class="mapIcon drawerIcon" :class="{ filtered: isFiltered }" @click="openFilterDrawer">
        <SvgIcon name="filter" />
      </div>
    </template>
    <div class="large-text">篩選</div>
  </n-popover>

  <!-- zoom Icon -->
  <div class="zoomControls">
    <n-popover placement="left" trigger="hover" class="responsivePopover" ref="zoomPopover">
      <template #trigger>
        <div class="zoomIcon" @click="zoomIn">
          <SvgIcon name="plus" />
        </div>
      </template>
      <div class="large-text">放大</div>
    </n-popover>

    <n-popover placement="left" trigger="hover" class="responsivePopover" ref="zoomPopoverOut">
      <template #trigger>
        <div class="zoomIcon" @click="zoomOut">
          <SvgIcon name="horizontal" />
        </div>
      </template>
      <div class="large-text">缩小</div>
    </n-popover>
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
.zoomControls {
  position: absolute;
  bottom: 114px;
  right: 1rem;
  display: flex;
  flex-direction: column;
  width: 32px;
  height: 60px;
  z-index: 1000;
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    border: 1px solid #ccc;
    pointer-events: none;
    transform: translateY(-50%);
  }
  .zoomIcon {
    width: 100%;
    height: 30px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    padding: 0.25rem;
    cursor: pointer;
    &:hover {
      background: #f4f4f4;
    }
    &:first-child {
      border-bottom: none;
      border-radius: 4px 4px 0 0;
    }
    &:last-child {
      border-top: none;
      border-radius: 0 0 4px 4px;
    }
  }
}
@media (max-width: 768px) {
  .responsivePopover {
    display: none !important;
  }
}
</style>
