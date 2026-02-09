import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { successMsg, errorMsg, warningMsg } from '@/utils/appMessage'

export const useSocketStore = defineStore('socket', () => {
  const socket: Ref<Socket | null> = ref(null)
  const isConnected = ref(false)
  const currentRoom: Ref<[string, number | null] | null> = ref(null)

  // 初始化 Socket 連接
  const initSocket = () => {
    if (socket.value) return // 防止重複初始化

    const socketUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3006'

    socket.value = io(socketUrl, {
      path: '/realtime/',
      reconnection: true, // 啟用自動重連
      reconnectionAttempts: 5, // 重連嘗試次數
      reconnectionDelay: 2000, // 重連延遲時間(毫秒)
      transports: ['websocket', 'polling'],
    })

    setupEventHandlers()
  }

  // 設置事件處理器
  const setupEventHandlers = () => {
    if (!socket.value) return

    // 連接成功
    socket.value.on('connect', () => {
      isConnected.value = true

      // 重連時自動加入之前的房間
      if (currentRoom.value && socket.value) {
        socket.value.emit('join:page', currentRoom.value)
      }
    })

    // 連接錯誤
    socket.value.on('connect_error', (error) => {
      isConnected.value = false
      errorMsg(`Connection error: ${error.message}`)
    })

    // 斷線
    socket.value.on('disconnect', (reason) => {
      isConnected.value = false

      // 只在非正常斷線時顯示警告
      if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
        warningMsg(`Connection interrupted: ${reason}`)
      }
    })

    // 重連成功
    socket.value.on('reconnect', () => {
      isConnected.value = true
      successMsg('Connection restored')
    })
  }

  // 加入房間
  const joinRoom = (page: string, userId: number | null = null) => {
    const roomData: [string, number | null] = [page, userId]
    currentRoom.value = roomData

    if (socket.value?.connected) {
      socket.value.emit('join:page', roomData)
    }
  }

  // 監聽特定事件
  const socketOn = (event: string, callback: (...args: any[]) => void) => {
    if (socket.value) {
      socket.value.on(event, callback)
    }
  }

  // 取消監聽特定事件
  const socketOff = (event: string, callback?: (...args: any[]) => void) => {
    if (socket.value) {
      socket.value.off(event, callback)
    }
  }

  // 發送事件
  const socketEmit = (event: string, data: any) => {
    if (socket.value?.connected) {
      socket.value.emit(event, data)
    }
  }

  // 清理連接
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
    isConnected.value = false
    currentRoom.value = null
  }

  return {
    socket,
    isConnected,
    currentRoom,
    initSocket,
    joinRoom,
    socketOn,
    socketOff,
    socketEmit,
    disconnect,
  }
})
