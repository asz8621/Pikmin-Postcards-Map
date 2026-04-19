import { ref, computed, shallowRef, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { locationApi } from '@/services'
import * as L from 'leaflet'
import type { LocationData, SearchResult } from '@/types'

// 設定地圖格網索引大小（單位：經緯度度數），數值越小，格子越細，處理大量點位時性能更好，但會增加索引重建與記憶體開銷
// - 幾千筆到一萬筆：建議設為 1
// - 一萬筆以上且密集：可嘗試 0.5
// - 高密度或卡頓情況下：可試 0.25
const GRID_SIZE = 1

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

  // location id 快取
  const locationLookup = shallowRef<Map<number, LocationData>>(new Map())

  // 地圖格網索引，降低 bounds 篩選時的全量掃描成本
  const spatialIndex = shallowRef<Map<string, Set<number>>>(new Map())

  const isFiltered = computed(() => !!typeFilter.value || featuresFilter.value.length > 0)

  const normalizeLng = (lng: number) => {
    if (!Number.isFinite(lng)) return lng

    let normalized = ((((lng + 180) % 360) + 360) % 360) - 180
    if (normalized === -180) normalized = 180
    return normalized
  }

  const getGridKey = (lat: number, lng: number) => {
    const latKey = Math.floor(lat / GRID_SIZE)
    const lngKey = Math.floor(normalizeLng(lng) / GRID_SIZE)
    return `${latKey}:${lngKey}`
  }

  const removeIndexBucket = (key: string, id: number) => {
    const bucket = spatialIndex.value.get(key)
    if (!bucket) return

    bucket.delete(id)
    if (bucket.size === 0) {
      spatialIndex.value.delete(key)
    }
  }

  const addIndexBucket = (location: LocationData) => {
    const key = getGridKey(location.lat, location.long)
    const bucket = spatialIndex.value.get(key)

    if (bucket) {
      bucket.add(location.id)
      return
    }

    spatialIndex.value.set(key, new Set([location.id]))
  }

  const rebuildIndexes = (locations: LocationData[]) => {
    const nextLookup = new Map<number, LocationData>()
    const nextSpatialIndex = new Map<string, Set<number>>()

    locations.forEach((location) => {
      nextLookup.set(location.id, location)

      const key = getGridKey(location.lat, location.long)
      const bucket = nextSpatialIndex.get(key)
      if (bucket) {
        bucket.add(location.id)
      } else {
        nextSpatialIndex.set(key, new Set([location.id]))
      }
    })

    locationLookup.value = nextLookup
    spatialIndex.value = nextSpatialIndex
  }

  const setMapAllData = (locations: LocationData[]) => {
    mapAllData.value = locations
    rebuildIndexes(locations)
  }

  const getLocationById = (id: number) => {
    return locationLookup.value.get(id) || null
  }

  const addLocation = (newData: LocationData) => {
    if (locationLookup.value.has(newData.id)) {
      updateLocation(newData.id, newData)
      return
    }

    mapAllData.value.push(newData)
    locationLookup.value.set(newData.id, newData)
    addIndexBucket(newData)
  }

  const updateLocation = (id: number, newData: Partial<LocationData>) => {
    const previous = locationLookup.value.get(id)
    const nextData = previous
      ? ({ ...previous, ...newData } as LocationData)
      : (newData as LocationData)

    const index = mapAllData.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      mapAllData.value[index] = nextData
    } else {
      mapAllData.value.push(nextData)
    }

    locationLookup.value.set(id, nextData)

    if (previous) {
      const prevKey = getGridKey(previous.lat, previous.long)
      const nextKey = getGridKey(nextData.lat, nextData.long)

      if (prevKey !== nextKey) {
        removeIndexBucket(prevKey, id)
        addIndexBucket(nextData)
      }
    } else {
      addIndexBucket(nextData)
    }
  }

  const removeLocation = (id: number) => {
    const location = locationLookup.value.get(id)
    if (!location) return

    mapAllData.value = mapAllData.value.filter((item) => item.id !== id)
    locationLookup.value.delete(id)
    removeIndexBucket(getGridKey(location.lat, location.long), id)
  }

  const collectCandidateIds = (bounds: L.LatLngBounds) => {
    const south = bounds.getSouth()
    const north = bounds.getNorth()
    const west = bounds.getWest()
    const east = bounds.getEast()

    if (![south, north, west, east].every(Number.isFinite)) {
      return Array.from(locationLookup.value.keys())
    }

    if (Math.abs(east - west) >= 360) {
      return Array.from(locationLookup.value.keys())
    }

    const candidateIds = new Set<number>()
    const latStart = Math.floor(south / GRID_SIZE)
    const latEnd = Math.floor(north / GRID_SIZE)

    const collectLngRange = (rangeStart: number, rangeEnd: number) => {
      const lngStart = Math.floor(rangeStart / GRID_SIZE)
      const lngEnd = Math.floor(rangeEnd / GRID_SIZE)

      for (let latKey = latStart; latKey <= latEnd; latKey += 1) {
        for (let lngKey = lngStart; lngKey <= lngEnd; lngKey += 1) {
          const bucket = spatialIndex.value.get(`${latKey}:${lngKey}`)
          if (!bucket) continue

          bucket.forEach((id) => candidateIds.add(id))
        }
      }
    }

    const normalizedWest = normalizeLng(west)
    const normalizedEast = normalizeLng(east)

    if (normalizedWest <= normalizedEast) {
      collectLngRange(normalizedWest, normalizedEast)
    } else {
      collectLngRange(normalizedWest, 180)
      collectLngRange(-180, normalizedEast)
    }

    return Array.from(candidateIds)
  }

  const fetchMapData = async () => {
    try {
      const res = await locationApi.getLocations()
      const locations = res.data.data
      setMapAllData(locations)

      const leafletMap = map.value
      if (leafletMap) {
        applyFilter(leafletMap.getBounds())
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const applyFilter = (bounds: L.LatLngBounds) => {
    const hasType = !!typeFilter.value
    const hasFeature = featuresFilter.value.length > 0
    const candidateIds = collectCandidateIds(bounds)

    const filtered = candidateIds.reduce<LocationData[]>((result, id) => {
      const location = locationLookup.value.get(id)
      if (!location) return result

      const inBounds = bounds.contains([location.lat, location.long])
      if (!inBounds) return result

      const typeMatch = hasType ? location.type === typeFilter.value : true
      if (!typeMatch) return result

      const featureMatch = hasFeature
        ? featuresFilter.value.every((fid) => location.features?.some((f) => f.id === fid))
        : true

      if (!featureMatch) return result

      result.push(location)
      return result
    }, [])

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
      const nextBounds = L.latLngBounds(coordinates)
      leafletMap.fitBounds(nextBounds, { padding: [50, 50], animate: true })
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
    locationLookup,
    getLocationById,
    setMapAllData,
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
