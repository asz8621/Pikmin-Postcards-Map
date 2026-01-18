<script setup>
import { ref, shallowRef, onMounted, onBeforeUnmount, watch, markRaw } from 'vue'
import L from 'leaflet'
import 'leaflet.markercluster'

import locationIconImg from '@/assets/images/location.png'
import mushroomIcon from '@/assets/images/mushroom.png'
import flowerIcon from '@/assets/images/flower.png'
import questionMark from '@/assets/images/question-mark.png'

import { useMapStore } from '@/stores/useMapStore'
import { useInfoStore } from '@/stores/useInfoStore'
import { useModalStore } from '@/stores/useModalStore'
import { useSocketStore } from '@/stores/useSocketStore'

import { errorMsg } from '@/utils/appMessage'
import { storeToRefs } from 'pinia'

const mapStore = useMapStore()
const { mapData, typeFilter, featuresFilter, isFiltered, searchResults } = storeToRefs(mapStore)
const { applyFilter, setVisibleItems, addLocation, updateLocation, removeLocation } = mapStore

const infoStore = useInfoStore()
const { updateFeature, removeFeature } = infoStore
const { features, userData } = storeToRefs(infoStore)

const modalStore = useModalStore()
const { openModal } = modalStore

const socketStore = useSocketStore()
const { joinRoom, socketOn, socketOff } = socketStore

const mapConfig = {
  minZoom: 2,
  maxZoom: 18,
  defaultZoom: 6,
  defaultCenter: [25.033, 121.5654],
  maxBounds: [
    [-85, -Infinity],
    [85, Infinity],
  ],
  maxBoundsViscosity: 1.0,
}

const typeList = [
  { label: '香菇', value: 'mushroom' },
  { label: '花', value: 'flower' },
]

const mapIcons = markRaw({
  location: L.icon({
    iconUrl: locationIconImg,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  mushroom: L.icon({
    iconUrl: mushroomIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  flower: L.icon({
    iconUrl: flowerIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  default: L.icon({
    iconUrl: questionMark,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
})

const map = shallowRef(null)
const markerClusterGroup = shallowRef(null)
const locationMarker = shallowRef(null)
const zoomLevel = ref(mapConfig.defaultZoom)
const typeTemp = ref(null)
const featuresTemp = ref([])
const showFilterDrawer = ref(false)

const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

const getIcon = (type) => mapIcons[type] || mapIcons.default

const openFilterDrawer = () => {
  typeTemp.value = typeFilter.value
  featuresTemp.value = [...featuresFilter.value]
  showFilterDrawer.value = true
}

const filterData = () => {
  if (!map.value) return

  typeFilter.value = typeTemp.value
  featuresFilter.value = [...featuresTemp.value]

  const filtered = applyFilter(map.value.getBounds())
  setVisibleItems(filtered)

  // 根據篩選結果調整地圖視野
  if (isFiltered.value) {
    map.value.setZoom(mapConfig.minZoom, { animate: true })
  } else if (filtered.length > 0) {
    const latLngs = filtered.map((item) => [item.lat, item.long])
    const bounds = L.latLngBounds(latLngs)
    map.value.fitBounds(bounds, { padding: [30, 30], animate: true })
  }

  showFilterDrawer.value = false
}

const goToCurrentLocation = () => {
  if (!map.value) return
  map.value.locate({ setView: true, maxZoom: mapConfig.maxZoom })
}

const handleLocationFound = (e) => {
  if (!map.value) return

  // 移除舊的位置標記
  if (locationMarker.value) {
    locationMarker.value.remove()
  }

  locationMarker.value = L.marker(e.latlng, { icon: mapIcons.location })
  locationMarker.value.addTo(map.value).bindPopup('您的位置')

  // 確保移動到使用者位置
  map.value.setView(e.latlng, 16, { animate: true })

  // 定位完成後執行 filterData
  filterData()
}

const handleLocationError = () => {
  errorMsg('無法獲取位置，使用預設座標')

  filterData()
}

const handleMoveEnd = debounce(() => {
  if (!map.value) return

  const filtered = applyFilter(map.value.getBounds())
  setVisibleItems(filtered)
}, 200)

const clearMarkers = () => {
  if (!map.value || !markerClusterGroup.value) return

  // 清理 cluster group 內的所有 marker
  markerClusterGroup.value.clearLayers()
  map.value.removeLayer(markerClusterGroup.value)
  markerClusterGroup.value = null
}

const renderMarkers = (data) => {
  if (!map.value || !Array.isArray(data)) return

  // 清理舊的 markers
  clearMarkers()

  // 創建新的 cluster group
  markerClusterGroup.value = markRaw(L.markerClusterGroup())

  data.forEach((item) => {
    const marker = L.marker([item.lat, item.long], {
      icon: getIcon(item.type),
    })
    marker.on('click', () => openModal('postcard', item))
    markerClusterGroup.value.addLayer(marker)
  })

  map.value.addLayer(markerClusterGroup.value)
}

const moveToSearchLocation = (location, viewport) => {
  if (!map.value) return

  if (viewport?.northeast && viewport?.southwest) {
    const bounds = L.latLngBounds(
      [viewport.southwest.lat, viewport.southwest.lng],
      [viewport.northeast.lat, viewport.northeast.lng],
    )
    map.value.fitBounds(bounds, { padding: [50, 50], animate: true })
  } else {
    map.value.setView([location.lat, location.lng], 15, { animate: true })
  }
}

const postcardTypeSocket = (socketData) => {
  if (socketData.method === 'update') {
    updateFeature(socketData.data)
  } else {
    removeFeature(socketData.data.id)
  }
}

const locationSocket = (socketData) => {
  const { method, data } = socketData

  switch (method) {
    case 'create':
      addLocation(data)
      break
    case 'update':
      if (!data) return
      updateLocation(data.id, data)
      break
    case 'delete':
      removeLocation(data.id)
      break
    default:
      errorMsg(`未知的方法: ${method}`)
      return
  }

  // 重新套用篩選並更新地圖顯示
  if (map.value) {
    const bounds = map.value.getBounds()
    const filtered = applyFilter(bounds)
    setVisibleItems(filtered)
  }
}

const initMap = () => {
  try {
    map.value = markRaw(
      L.map('map', {
        doubleClickZoom: false,
        zoomControl: false,
        minZoom: mapConfig.minZoom,
        maxZoom: mapConfig.maxZoom,
        maxBounds: mapConfig.maxBounds,
        maxBoundsViscosity: mapConfig.maxBoundsViscosity,
        worldCopyJump: true,
      }).setView(mapConfig.defaultCenter, zoomLevel.value),
    )

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: mapConfig.maxZoom,
    }).addTo(map.value)

    L.control.zoom({ position: 'bottomright' }).addTo(map.value)

    map.value.on('moveend', handleMoveEnd)
    map.value.on('locationfound', handleLocationFound)
    map.value.on('locationerror', handleLocationError)

    // 初始定位
    map.value.locate({ setView: true, maxZoom: 16 })
  } catch (error) {
    console.error('地圖初始化失敗:', error)
    errorMsg('地圖載入失敗，請重新整理頁面')
  }
}

const cleanupMap = () => {
  // 清理位置標記
  if (locationMarker.value) {
    locationMarker.value.remove()
    locationMarker.value = null
  }

  // 清理 marker cluster
  clearMarkers()

  // 清理地圖
  if (map.value) {
    map.value.off('moveend', handleMoveEnd)
    map.value.off('locationfound', handleLocationFound)
    map.value.off('locationerror', handleLocationError)
    map.value.remove()
    map.value = null
  }
}

watch(
  () => mapData.value,
  (newData) => {
    if (!map.value) return
    renderMarkers(newData)
  },
)

watch(
  () => searchResults.value,
  (newData) => {
    if (!map.value || !newData?.result?.place_id) return

    const { location, viewport } = newData.result
    moveToSearchLocation(location, viewport)
  },
)

onMounted(() => {
  initMap()
  joinRoom('map', userData.value?.id || null)
  socketOn('postcardType', postcardTypeSocket)
  socketOn('location', locationSocket)
})

onBeforeUnmount(() => {
  socketOff('location')
  socketOff('postcardType')
  cleanupMap()
})
</script>

<template>
  <div id="map"></div>

  <div class="mapIcon locationIcon" @click="goToCurrentLocation">
    <SvgIcon name="location" width="24" height="24" fill="red" />
  </div>

  <div class="mapIcon drawerIcon" :class="{ filtered: isFiltered }" @click="openFilterDrawer">
    <SvgIcon name="filter" width="24" height="24" fill="red" />
  </div>

  <n-drawer
    v-model:show="showFilterDrawer"
    :width="300"
    placement="right"
    :auto-focus="false"
    :close-on-esc="false"
    :mask-closable="false"
  >
    <n-drawer-content title="篩選明信片" closable>
      <n-form>
        <n-form-item path="type" label="類型">
          <n-select v-model:value="typeTemp" :options="typeList" placeholder="選擇類型" clearable />
        </n-form-item>
        <n-form-item path="features" label="標籤">
          <n-select
            v-model:value="featuresTemp"
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

      <n-button type="primary" @click="filterData" style="width: 100%">確認</n-button>
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
