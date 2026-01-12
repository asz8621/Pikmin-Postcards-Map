<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet.markercluster'

import locationIconImg from '@/assets/images/location.png'
import mushroomIcon from '@/assets/images/mushroom.png'
import flowerIcon from '@/assets/images/flower.png'
import questionMark from '@/assets/images/question-mark.png'

import { useMapStore } from '@/stores/useMapStore'
import { useInfoStore } from '@/stores/useInfoStore'
import { useModalStore } from '@/stores/useModalStore'
import { useAppMessage } from '@/composables/useAppMessage'
import { useSocketStore } from '@/stores/useSocketStore'
import { storeToRefs } from 'pinia'

const mapStore = useMapStore()
const { mapData, typeFilter, featuresFilter, isFiltered } = storeToRefs(mapStore)
const { applyFilter, setVisibleItems, addLocation, updateLocation, removeLocation } = mapStore

const infoStore = useInfoStore()
const { features, userData } = storeToRefs(infoStore)

const modalStore = useModalStore()
const { openModal } = modalStore

const { errorMsg } = useAppMessage()

const socketStore = useSocketStore()
const { joinRoom, socketOn, socketOff } = socketStore

let map = null
const zoomLevel = ref(16)
const maxZoom = 18

const typeTemp = ref(null)
const featuresTemp = ref([])

const showFilterDrawer = ref(false)

const openFilterDrawer = () => {
  typeTemp.value = typeFilter.value
  featuresTemp.value = [...featuresFilter.value]
  showFilterDrawer.value = true
}

const typeList = [
  { label: '香菇', value: 'mushroom' },
  { label: '花', value: 'flower' },
]

const filterData = () => {
  typeFilter.value = typeTemp.value
  featuresFilter.value = [...featuresTemp.value]

  const filtered = applyFilter(map.getBounds())
  setVisibleItems(filtered)

  if (filtered.length > 0) {
    const latLngs = filtered.map((item) => [item.lat, item.long])
    const bounds = L.latLngBounds(latLngs)
    map.fitBounds(bounds, { padding: [30, 30], animate: true })
  }

  showFilterDrawer.value = false
}

const goToCurrentLocation = () => {
  if (!map) return
  map.locate({ setView: true, maxZoom })
}

const setIcon = (type) => {
  const icons = {
    mushroom: mushroomIcon,
    flower: flowerIcon,
    default: questionMark,
  }
  return L.icon({
    iconUrl: icons[type] || icons.default,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

const initMap = () => {
  map = L.map('map', {
    doubleClickZoom: false,
    zoomControl: false,
    minZoom: 2,
    maxZoom: 18,
    maxBounds: [
      [-85, -Infinity], // 南極限制,經度不限
      [85, Infinity], // 北極限制,經度不限
    ],
    maxBoundsViscosity: 1.0, // 完全禁止超出邊界
    worldCopyJump: true, // 允許左右無限滑動並自動跳轉回主地圖
  }).setView([25.033, 121.5654], zoomLevel.value)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
  }).addTo(map)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  const locationIcon = L.icon({
    iconUrl: locationIconImg,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })

  map.on('locationfound', (e) => {
    const locationMarker = L.marker(e.latlng, { icon: locationIcon })
    locationMarker.addTo(map).bindPopup('您的位置').openPopup()
  })

  map.on('moveend', () => {
    const filtered = applyFilter(map.getBounds())
    setVisibleItems(filtered)
  })

  map.on('locationerror', () => {
    errorMsg('無法獲取位置，使用預設座標')
  })

  map.locate({ setView: true, maxZoom })

  renderMarkers(mapData.value)
}

const renderMarkers = (data) => {
  const markers = L.markerClusterGroup()

  data.forEach((item) => {
    const marker = L.marker([item.lat, item.long], {
      icon: setIcon(item.type),
    })
    marker.on('click', () => openModal('postcard', item))
    markers.addLayer(marker)
  })

  map.addLayer(markers)
}

watch(
  () => mapData.value,
  (newData) => {
    if (!map) return

    map.eachLayer((layer) => {
      if (layer instanceof L.MarkerClusterGroup) {
        map.removeLayer(layer)
      }
    })

    renderMarkers(newData)
  },
)

onMounted(() => {
  initMap()

  joinRoom('map', userData.value?.id || null)

  socketOn('location', (socketData) => {
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
    if (map) {
      const bounds = map.getBounds()
      const filtered = applyFilter(bounds)
      setVisibleItems(filtered)
    }
  })
})

onUnmounted(() => {
  socketOff('location')
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
