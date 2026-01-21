import { onMounted, onUnmounted } from 'vue'
import { useSocketStore } from '@/stores/useSocketStore'
import { useInfoStore } from '@/stores/useInfoStore'
import { useMapStore } from '@/stores/useMapStore'
import { errorMsg } from '@/utils/appMessage'

export const useSocketEvents = () => {
  const socketStore = useSocketStore()
  const { socketOn, socketOff, joinRoom } = socketStore

  const infoStore = useInfoStore()
  const { updateFeature, removeFeature } = infoStore

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

  return {
    joinRoom,
    useSocketListener,
    handleLocation,
    handlePostcardType,
  }
}
