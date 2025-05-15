import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from '@/plugins/axios'

export const useMapStore = defineStore('map', () => {
  const mapAllData = ref([])
  const mapData = ref([])
  const typeFilter = ref(null)
  const featuresFilter = ref([])

  const isFiltered = computed(() => !!typeFilter.value || featuresFilter.value.length > 0)

  const fetchMapData = async () => {
    const res = await axios.get('/user/locations')
    mapAllData.value = res.data.data
    mapData.value = res.data.data
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

      return (hasType || hasFeature || inBounds) && typeMatch && featureMatch
    })

    mapData.value = filtered
    return filtered
  }

  return {
    mapAllData,
    mapData,
    typeFilter,
    featuresFilter,
    isFiltered,
    applyFilter,
    fetchMapData,
    setVisibleItems,
  }
})
