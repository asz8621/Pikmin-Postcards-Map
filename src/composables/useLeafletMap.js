import { ref, shallowRef, markRaw, watch } from 'vue'
import L from 'leaflet'
import 'leaflet.markercluster'
import { useModalStore } from '@/stores/useModalStore'
import { useMapStore } from '@/stores/useMapStore'
import { storeToRefs } from 'pinia'
import { warningMsg, errorMsg } from '@/utils/appMessage'

import locationIconImg from '@/assets/images/location.png'
import mushroomIcon from '@/assets/images/mushroom.png'
import flowerIcon from '@/assets/images/flower.png'
import questionMark from '@/assets/images/question-mark.png'

// 建立地圖圖標
const createIcon = (iconPath) => {
  return L.icon({
    iconUrl: iconPath,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// 地圖圖標配置
const mapIcons = markRaw({
  location: createIcon(locationIconImg),
  mushroom: createIcon(mushroomIcon),
  flower: createIcon(flowerIcon),
  default: createIcon(questionMark),
})

// 根據類型獲取對應圖標
const getIcon = (type) => mapIcons[type] || mapIcons.default

// 定位選項配置
const locateOptions = {
  setView: false, // 關閉 Leaflet 自動移動視野，避免與 handleLocationFound 中的 setView 重複觸發
  enableHighAccuracy: true, // 使用高精度定位
  timeout: 300000, // 逾時時間 30 秒
  maximumAge: 0, // 不使用快取位置
}

const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export const useLeafletMap = (options = {}) => {
  const { containerId } = options

  const modalStore = useModalStore()
  const { openModal } = modalStore

  const mapStore = useMapStore()
  const { map, mapData, searchResults, isLocated, isLocating } = storeToRefs(mapStore)
  const { mapConfig, applyFilterWithView, refreshMapView } = mapStore
  const { defaultZoom, minZoom, maxZoom, maxBounds, maxBoundsViscosity, defaultCenter } = mapConfig

  const markerClusterGroup = shallowRef(null)
  const locationMarker = shallowRef(null)
  const zoomLevel = ref(defaultZoom)

  // 初始化地圖
  const initMap = () => {
    try {
      if (!containerId) {
        errorMsg('地圖 ID 未提供')
        return
      }

      map.value = markRaw(
        L.map(containerId, {
          doubleClickZoom: false,
          zoomControl: false,
          minZoom,
          maxZoom,
          maxBounds,
          maxBoundsViscosity,
          worldCopyJump: true,
        }).setView(defaultCenter, zoomLevel.value),
      )

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom,
      }).addTo(map.value)

      // 綁定地圖事件
      map.value.on('moveend', handleMoveEnd)
      map.value.on('locationfound', handleLocationFound)
      map.value.on('locationerror', handleLocationError)
      map.value.on('zoomend', handleZoomend)

      // 初始定位
      map.value.locate(locateOptions)
    } catch (error) {
      errorMsg(`地圖載入失敗: ${error}`)
    }
  }

  // 處理定位成功
  const handleLocationFound = (e) => {
    if (!map.value) return

    // 移除舊的位置標記
    if (locationMarker.value) {
      locationMarker.value.remove()
    }

    locationMarker.value = L.marker(e.latlng, { icon: mapIcons.location })
    locationMarker.value.addTo(map.value).bindPopup('您的位置')

    // 移動到使用者位置
    map.value.setView(e.latlng, 16, { animate: true })

    // 只在初始定位時執行 applyFilterWithView
    if (!isLocated.value) {
      applyFilterWithView()
      isLocated.value = true
    } else {
      // 手動定位時只更新資料,不調整視野
      refreshMapView()
    }

    isLocating.value = false
  }

  // 處理定位錯誤
  const handleLocationError = (error) => {
    let message = '無法取得您的位置，使用預設座標'
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        message = '定位權限被拒絕，請在瀏覽器設定中允許定位權限'
        break
      case 2: // POSITION_UNAVAILABLE
        message = '無法取得位置資訊，請確認您的裝置定位功能已開啟'
        break
      case 3: // TIMEOUT
        message = '定位請求逾時，請檢查網路連線'
        break
    }

    warningMsg(message)

    // 初始定位完成，並載入地圖資料
    isLocated.value = true
    isLocating.value = false

    applyFilterWithView()
  }

  const handleZoomend = () => {
    if (!map.value) return
    zoomLevel.value = map.value.getZoom()
  }

  // 處理地圖移動結束
  const handleMoveEnd = debounce(() => {
    if (!map.value) return
    refreshMapView()
  }, 200)

  // 前往當前位置
  const currentLocation = () => {
    if (!map.value || isLocating.value) return

    isLocating.value = true
    // 定位觸發 handleLocationFound 或 handleLocationError
    map.value.locate(locateOptions)
  }

  // 清除標記
  const clearMarkers = () => {
    if (!map.value || !markerClusterGroup.value) return

    // 清理 cluster group 內的所有 marker
    markerClusterGroup.value.clearLayers()
    map.value.removeLayer(markerClusterGroup.value)
    markerClusterGroup.value = null
  }

  // 渲染標記
  const renderMarkers = (data) => {
    if (!map.value) {
      errorMsg('地圖未初始化，標記載入失敗')
      return
    }

    if (!Array.isArray(data)) {
      errorMsg('標記數據格式錯誤')
      return
    }

    try {
      // 清除標記
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
    } catch (error) {
      errorMsg(`標記載入失敗: ${error}`)
    }
  }

  // 移動到搜尋位置
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

  // 清理地圖
  const cleanupMap = () => {
    // 清理位置標記
    if (locationMarker.value) {
      locationMarker.value.remove()
      locationMarker.value = null
    }

    // 清除標記
    clearMarkers()

    // 清理地圖事件和實例
    if (map.value) {
      map.value.off('moveend', handleMoveEnd)
      map.value.off('locationfound', handleLocationFound)
      map.value.off('locationerror', handleLocationError)
      map.value.off('zoomend', handleZoomend)

      // 停止任何進行中的定位
      map.value.stopLocate()

      // 銷毀地圖實例
      map.value.remove()
      map.value = null
    }

    // 重置其他狀態
    zoomLevel.value = defaultZoom
    isLocated.value = false
    isLocating.value = false
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

  return {
    markerClusterGroup,
    locationMarker,
    zoomLevel,
    isLocated,
    isLocating,
    initMap,
    currentLocation,
    clearMarkers,
    renderMarkers,
    moveToSearchLocation,
    cleanupMap,
  }
}
