import { storeToRefs } from 'pinia'
import { useMapStore } from '@/stores/useMapStore'

export const useMapFilter = () => {
  const mapStore = useMapStore()
  const { typeFilter, featuresFilter, filterDrawer } = storeToRefs(mapStore)
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
    typeFilter.value = null
    featuresFilter.value = []
    applyFilterWithView()
    closeFilterDrawer()
  }

  return {
    typeFilter,
    featuresFilter,
    filterDrawer,
    openFilterDrawer,
    closeFilterDrawer,
    applyFilter,
    resetFilter,
  }
}
