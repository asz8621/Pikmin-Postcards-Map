import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSocketStore } from '@/stores/useSocketStore'
import { useInfoStore } from '@/stores/useInfoStore'
import { useMapStore } from '@/stores/useMapStore'
import { errorMsg } from '@/utils/appMessage'

export const useSocketEvents = () => {
  const socketStore = useSocketStore()
  const { socketOn, socketOff, joinRoom, initSocket } = socketStore

  const infoStore = useInfoStore()
  const { updateFeature, removeFeature } = infoStore
  const { contribute } = storeToRefs(infoStore)

  const mapStore = useMapStore()
  const { addLocation, updateLocation, removeLocation } = mapStore

  // socket 事件監聽
  const useSocketListener = (eventName, handler) => {
    onMounted(() => {
      socketOn(eventName, handler)
    })

    onUnmounted(() => {
      socketOff(eventName, handler)
    })
  }

  // 類型資料處理
  const handlePostcardType = (socketData) => {
    const { method, data } = socketData

    if (method === 'update') {
      updateFeature(data)
    } else {
      removeFeature(data.id)
    }
  }

  // 點位資料處理
  const handleLocation = (socketData) => {
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
    }
  }

  // 使用者的貢獻處理
  const handleUserContribute = (socketData) => {
    const { data } = socketData

    if (data.name) {
      // 修改
      const index = contribute.value.findIndex((item) => item.id === data.id)
      if (index !== -1) {
        contribute.value[index] = data
      }
    } else {
      // 刪除
      contribute.value = contribute.value.filter((item) => item.id !== data.id)
    }
  }

  return {
    initSocket,
    joinRoom,
    useSocketListener,
    handleLocation,
    handlePostcardType,
    handleUserContribute,
  }
}
