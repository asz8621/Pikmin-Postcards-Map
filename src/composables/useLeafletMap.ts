import { ref, shallowRef, markRaw, watch } from 'vue'
import * as L from 'leaflet'
import type { LocationEvent, ErrorEvent } from 'leaflet'
import 'leaflet.markercluster'
import { useModalStore } from '@/stores/useModalStore'
import { useMapStore } from '@/stores/useMapStore'
import { storeToRefs } from 'pinia'
import { warningMsg, errorMsg } from '@/utils/appMessage'
import type { LocationData } from '@/types'

import locationIconImg from '@/assets/images/location.png'
import mushroomIcon from '@/assets/images/mushroom.png'
import flowerIcon from '@/assets/images/flower.png'
import questionMark from '@/assets/images/question-mark.png'

// 建立地圖圖標
const createIcon = (iconPath: string) => {
  return L.icon({
    iconUrl: iconPath,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

type MapIconKey = 'location' | 'mushroom' | 'flower' | 'default'

// 地圖圖標配置
const mapIcons: Record<MapIconKey, L.Icon> = markRaw({
  location: createIcon(locationIconImg),
  mushroom: createIcon(mushroomIcon),
  flower: createIcon(flowerIcon),
  default: createIcon(questionMark),
})

// 根據類型獲取對應圖標
const getIcon = (type: string): L.Icon => {
  if (type in mapIcons) {
    return mapIcons[type as MapIconKey]
  }
  return mapIcons.default
}

// 定位選項配置
const locateOptions = {
  setView: false, // 關閉 Leaflet 自動移動視野，避免與 handleLocationFound 中的 setView 重複觸發
  enableHighAccuracy: true, // 使用高精度定位
  timeout: 300000, // 逾時時間 30 秒
  maximumAge: 0, // 不使用快取位置
}

const debounce = <T extends (...args: unknown[]) => void>(fn: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export const useLeafletMap = (options: { containerId?: string } = {}) => {
  const { containerId } = options

  const modalStore = useModalStore()
  const { openModal } = modalStore

  const mapStore = useMapStore()
  const { map, mapData, searchResults, isLocated, isLocating } = storeToRefs(mapStore)
  const { mapConfig, applyFilterWithView, refreshMapView } = mapStore
  const { defaultZoom, minZoom, maxZoom, maxBounds, maxBoundsViscosity, defaultCenter } = mapConfig

  const markerClusterGroup = shallowRef<L.MarkerClusterGroup | null>(null)
  const locationMarker = shallowRef<L.Marker | null>(null)
  const zoomLevel = ref(defaultZoom)

  // 初始化地圖
  const initMap = () => {
    try {
      if (!containerId) {
        errorMsg('地圖 ID 未提供')
        return
      }

      const instance = L.map(containerId, {
        doubleClickZoom: false,
        zoomControl: false,
        minZoom,
        maxZoom,
        maxBounds: maxBounds as L.LatLngBoundsExpression,
        maxBoundsViscosity,
        worldCopyJump: true,
      }).setView(defaultCenter as [number, number], zoomLevel.value)

      map.value = markRaw(instance)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom,
      }).addTo(instance)

      // 綁定地圖事件
      instance.on('moveend', handleMoveEnd)
      instance.on('locationfound', handleLocationFound)
      instance.on('locationerror', handleLocationError)
      instance.on('zoomend', handleZoomend)

      // 初始定位
      instance.locate(locateOptions)
    } catch (error) {
      errorMsg(`地圖載入失敗: ${error}`)
    }
  }

  // 處理定位成功
  const handleLocationFound = (e: LocationEvent) => {
    const leafletMap = map.value
    if (!leafletMap) return

    // 移除舊的位置標記
    if (locationMarker.value) {
      locationMarker.value.remove()
    }

    const marker = L.marker(e.latlng, { icon: mapIcons.location })
    marker.addTo(leafletMap).bindPopup('您的位置')
    locationMarker.value = marker

    // 移動到使用者位置
    leafletMap.setView(e.latlng, 16, { animate: true })

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
  const handleLocationError = (error: ErrorEvent) => {
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
    const leafletMap = map.value
    if (!leafletMap) return
    zoomLevel.value = leafletMap.getZoom()
  }

  // 處理地圖移動結束
  const handleMoveEnd = debounce(() => {
    refreshMapView()
  }, 200)

  // 前往當前位置
  const currentLocation = () => {
    const leafletMap = map.value
    if (!leafletMap || isLocating.value) return

    isLocating.value = true
    // 定位觸發 handleLocationFound 或 handleLocationError
    leafletMap.locate(locateOptions)
  }

  // 清除標記
  const clearMarkers = () => {
    const clusterGroup = markerClusterGroup.value
    if (!clusterGroup) return

    // 清理 cluster group 內的所有 marker
    clusterGroup.clearLayers()
    map.value?.removeLayer(clusterGroup)
    markerClusterGroup.value = null
  }

  // 渲染標記
  const renderMarkers = (data: LocationData[]) => {
    const leafletMap = map.value
    if (!leafletMap) {
      errorMsg('地圖未初始化，標記載入失敗')
      return
    }

    try {
      // 清除標記
      clearMarkers()

      // 創建新的 cluster group
      const clusterGroup = markRaw(L.markerClusterGroup())
      markerClusterGroup.value = clusterGroup

      data.forEach((item) => {
        const marker = L.marker([item.lat, item.long], {
          icon: getIcon(item.type),
        })
        marker.on('click', () => openModal('postcard', item))
        clusterGroup.addLayer(marker)
      })

      leafletMap.addLayer(clusterGroup)
    } catch (error) {
      errorMsg(`標記載入失敗: ${error}`)
    }
  }

  type SearchCoordinate = { lat: number; lng: number }
  type SearchViewport = { northeast: SearchCoordinate; southwest: SearchCoordinate }

  // 移動到搜尋位置
  const moveToSearchLocation = (location: SearchCoordinate, viewport?: SearchViewport) => {
    const leafletMap = map.value
    if (!leafletMap) return

    if (viewport?.northeast && viewport?.southwest) {
      const bounds = L.latLngBounds(
        [viewport.southwest.lat, viewport.southwest.lng],
        [viewport.northeast.lat, viewport.northeast.lng],
      )
      leafletMap.fitBounds(bounds, { padding: [50, 50], animate: true })
    } else {
      leafletMap.setView([location.lat, location.lng], 15, { animate: true })
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
    const leafletMap = map.value
    if (leafletMap) {
      leafletMap.off('moveend', handleMoveEnd)
      leafletMap.off('locationfound', handleLocationFound)
      leafletMap.off('locationerror', handleLocationError)
      leafletMap.off('zoomend', handleZoomend)

      // 停止任何進行中的定位
      leafletMap.stopLocate()

      // 銷毀地圖實例
      leafletMap.remove()
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
      renderMarkers(newData)
    },
  )

  watch(
    () => searchResults.value,
    (newData) => {
      if (!newData?.result?.place_id) return

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
