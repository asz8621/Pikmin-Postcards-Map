import { ref, computed, shallowRef, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { locationApi } from '@/services'
import * as L from 'leaflet'
import type { LocationData, SearchResult } from '@/types'

export const useMapStore = defineStore('map', () => {
  // 地圖配置
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

  const map = shallowRef<L.Map | null>(null)

  const mapAllData: Ref<LocationData[]> = ref([])
  const mapData: Ref<LocationData[]> = ref([])
  const typeFilter: Ref<string | null> = ref(null)
  const featuresFilter: Ref<number[]> = ref([])
  const searchResults: Ref<SearchResult | null> = ref(null)
  const isSearch = ref(false)
  const filterDrawer = ref(false)
  const isLocating = ref(false) // 是否正在定位
  const isLocated = ref(false) // 是否已完成首次定位

  const isFiltered = computed(() => !!typeFilter.value || featuresFilter.value.length > 0)

  const addLocation = (newData: LocationData) => {
    mapAllData.value.push(newData)
  }

  const updateLocation = (id: number, newData: Partial<LocationData>) => {
    const index = mapAllData.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      mapAllData.value[index] = { ...mapAllData.value[index], ...newData } as LocationData
    } else {
      addLocation(newData as LocationData)
    }
  }

  const removeLocation = (id: number) => {
    mapAllData.value = mapAllData.value.filter((item) => item.id !== id)
  }

  const fetchMapData = async () => {
    try {
      const res = await locationApi.getLocations()
      mapAllData.value = res.data.data
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const applyFilter = (bounds: L.LatLngBounds) => {
    const hasType = !!typeFilter.value
    const hasFeature = featuresFilter.value.length > 0

    const filtered = mapAllData.value.filter((location) => {
      const inBounds = bounds.contains([location.lat, location.long])
      const typeMatch = hasType ? location.type === typeFilter.value : true
      const featureMatch = hasFeature
        ? featuresFilter.value.every((fid) => location.features?.some((f) => f.id === fid))
        : true

      if (!hasType && !hasFeature) return inBounds

      return inBounds && typeMatch && featureMatch
    })

    mapData.value = filtered
    return filtered
  }

  // 篩選並調整地圖視野
  const applyFilterWithView = () => {
    const leafletMap = map.value
    if (!leafletMap) return []

    const filtered = applyFilter(leafletMap.getBounds())

    // 根據篩選結果調整地圖視野
    if (isFiltered.value) {
      // 有篩選條件：縮到最小，顯示全球
      leafletMap.setZoom(mapConfig.minZoom, { animate: true })
    } else if (filtered.length > 0) {
      // 無篩選條件且有結果：自動調整視野以顯示所有點
      const coordinates: [number, number][] = filtered.map((item) => [item.lat, item.long])
      const bounds = L.latLngBounds(coordinates)
      leafletMap.fitBounds(bounds, { padding: [50, 50], animate: true })
    }

    return filtered
  }

  const searchAddress = async (address: string) => {
    try {
      isSearch.value = true
      const encodedAddress = encodeURIComponent(address.trim())
      const res = await locationApi.searchAddress(encodedAddress)
      searchResults.value = res.data.data
    } catch (error) {
      return Promise.reject(error)
    } finally {
      isSearch.value = false
    }
  }

  // 刷新地圖
  const refreshMapView = () => {
    const leafletMap = map.value
    if (!leafletMap) return
    applyFilter(leafletMap.getBounds())
  }

  const zoomIn = () => {
    const leafletMap = map.value
    if (!leafletMap || leafletMap.getZoom() >= leafletMap.getMaxZoom()) return
    leafletMap.zoomIn()
  }

  const zoomOut = () => {
    const leafletMap = map.value
    if (!leafletMap || leafletMap.getZoom() <= leafletMap.getMinZoom()) return
    leafletMap.zoomOut()
  }

  return {
    mapConfig,
    map,
    mapAllData,
    mapData,
    typeFilter,
    featuresFilter,
    isFiltered,
    searchResults,
    isSearch,
    filterDrawer,
    isLocated,
    isLocating,
    searchAddress,
    applyFilter,
    applyFilterWithView,
    fetchMapData,
    addLocation,
    updateLocation,
    removeLocation,
    refreshMapView,
    zoomIn,
    zoomOut,
  }
})
