import { storeToRefs } from 'pinia'
import { useMapStore } from '@/stores/useMapStore'

export const useMapFilter = () => {
  const mapStore = useMapStore()
  const { typeFilter, featuresFilter, filterDrawer, isFiltered } = storeToRefs(mapStore)
  const { applyFilterWithView } = mapStore

  // 打開篩選抽屜
  const openFilterDrawer = () => {
    filterDrawer.value = true
  }

  // 關閉篩選抽屜
  const closeFilterDrawer = () => {
    filterDrawer.value = false
  }

  // 確認篩選
  const applyFilter = () => {
    applyFilterWithView()
    closeFilterDrawer()
  }

  // 重置篩選
  const resetFilter = () => {
    if (!isFiltered.value) return

    typeFilter.value = null
    featuresFilter.value = []
    applyFilter()
  }

  return {
    typeFilter,
    featuresFilter,
    filterDrawer,
    isFiltered,
    openFilterDrawer,
    closeFilterDrawer,
    applyFilter,
    resetFilter,
  }
}
