import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { locationApi } from '@/services'

export const useMapStore = defineStore('map', () => {
  const mapAllData = ref([])
  const mapData = ref([])
  const typeFilter = ref(null)
  const featuresFilter = ref([])
  const searchResults = ref(null)
  const isSearch = ref(false)

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

  const setVisibleItems = (items) => {
    mapData.value = items
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

  return {
    mapAllData,
    mapData,
    typeFilter,
    featuresFilter,
    isFiltered,
    searchResults,
    isSearch,
    searchAddress,
    applyFilter,
    fetchMapData,
    setVisibleItems,
    addLocation,
    updateLocation,
    removeLocation,
  }
})
