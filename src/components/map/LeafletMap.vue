<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useMapStore } from '@/stores/useMapStore'
import { useInfoStore } from '@/stores/useInfoStore'
import { useSocketEvents } from '@/composables/useSocketEvents'
import { useLeafletMap } from '@/composables/useLeafletMap'
import { useMapFilter } from '@/composables/useMapFilter'
import { useLocationForm } from '@/composables/useLocationForm'
import { storeToRefs } from 'pinia'

const mapStore = useMapStore()
const { isFiltered } = storeToRefs(mapStore)
const { refreshMapView } = mapStore

const infoStore = useInfoStore()
const { features, userData } = storeToRefs(infoStore)

const { typeOptions } = useLocationForm()

const { handlePostcardType, handleLocation, useSocketListener, joinRoom } = useSocketEvents()

const { initMap, currentLocation, cleanupMap } = useLeafletMap({ containerId: 'map' })

const { typeFilter, featuresFilter, filterDrawer, openFilterDrawer, applyFilter, resetFilter } =
  useMapFilter()

// 類型 socket 處理
const postcardTypeSocket = (socketData) => {
  handlePostcardType(socketData)
}

// 點位 socket 處理
const locationSocket = (socketData) => {
  // 資料處理
  handleLocation(socketData)

  // 地圖更新
  refreshMapView()
}

// 註冊 Socket 事件監聽器
useSocketListener('postcardType', postcardTypeSocket)
useSocketListener('location', locationSocket)

onMounted(() => {
  initMap()
  joinRoom('map', userData.value?.id || null)
})

onBeforeUnmount(() => {
  cleanupMap()
})
</script>

<template>
  <div id="map"></div>

  <div class="mapIcon locationIcon" @click="currentLocation">
    <SvgIcon name="location" />
  </div>

  <div class="mapIcon drawerIcon" :class="{ filtered: isFiltered }" @click="openFilterDrawer">
    <SvgIcon name="filter" />
  </div>

  <n-drawer
    v-model:show="filterDrawer"
    :width="300"
    placement="right"
    :auto-focus="false"
    :close-on-esc="false"
    :mask-closable="false"
  >
    <n-drawer-content title="篩選明信片" closable>
      <n-form>
        <n-form-item path="type" label="類型">
          <n-select
            v-model:value="typeFilter"
            :options="typeOptions"
            placeholder="選擇類型"
            clearable
          />
        </n-form-item>
        <n-form-item path="features" label="標籤">
          <n-select
            v-model:value="featuresFilter"
            :options="features"
            label-field="name"
            value-field="id"
            multiple
            filterable
            clearable
            placeholder="選擇標籤"
          />
        </n-form-item>
      </n-form>

      <div class="flex gap-2">
        <n-button class="flex-1" @click="resetFilter">重置</n-button>
        <n-button type="primary" class="flex-1" @click="applyFilter">確認</n-button>
      </div>
    </n-drawer-content>
  </n-drawer>
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
  }
  &.drawerIcon {
    bottom: 218px;
    &.filtered {
      background: #807bff;
      color: #fff;
    }
  }
}
</style>
