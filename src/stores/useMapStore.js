import { ref, computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { locationApi } from '@/services'
import L from 'leaflet'

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

  const map = shallowRef(null)

  const mapAllData = ref([])
  const mapData = ref([])
  const typeFilter = ref(null)
  const featuresFilter = ref([])
  const searchResults = ref(null)
  const isSearch = ref(false)
  const filterDrawer = ref(false)
  const isLocating = ref(false) // 是否正在定位
  const isLocated = ref(false) // 是否已完成首次定位

  const isFiltered = computed(() => !!typeFilter.value || featuresFilter.value.length > 0)

  const addLocation = (newData) => {
    mapAllData.value.push(newData)
  }

  const updateLocation = (id, newData) => {
    const index = mapAllData.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      mapAllData.value[index] = { ...mapAllData.value[index], ...newData }
    } else {
      addLocation(newData)
    }
  }

  const removeLocation = (id) => {
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

  const applyFilter = (bounds) => {
    const hasType = !!typeFilter.value
    const hasFeature = featuresFilter.value.length > 0

    const filtered = mapAllData.value.filter((location) => {
      const inBounds = bounds.contains([location.lat, location.long])
      const typeMatch = hasType ? location.type === typeFilter.value : true
      const featureMatch = hasFeature
        ? featuresFilter.value.every((fid) => location.features.some((f) => f.id === fid))
        : true

      if (!hasType && !hasFeature) return inBounds

      return inBounds && typeMatch && featureMatch
    })

    mapData.value = filtered
    return filtered
  }

  // 篩選並調整地圖視野
  const applyFilterWithView = () => {
    if (!map.value) return []

    const filtered = applyFilter(map.value.getBounds())

    // 根據篩選結果調整地圖視野
    if (isFiltered.value) {
      // 有篩選條件：縮到最小，顯示全球
      map.value.setZoom(mapConfig.minZoom, { animate: true })
    } else if (filtered.length > 0) {
      // 無篩選條件且有結果：自動調整視野以顯示所有點
      const latLngs = filtered.map((item) => [item.lat, item.long])
      const bounds = L.latLngBounds(latLngs)
      map.value.fitBounds(bounds, { padding: [50, 50], animate: true })
    }
  }

  const searchAddress = async (address) => {
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
    if (!map.value) return
    applyFilter(map.value.getBounds())
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
  }
})
