import { io } from 'socket.io-client'

const socketUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:3006'

let currentRoom = null

// 建立 Socket.IO 連接
const socket = io(socketUrl, {
  path: '/realtime/',
  reconnection: true, // 啟用自動重連
  reconnectionAttempts: 5, // 重連嘗試次數
  reconnectionDelay: 2000, // 重連延遲時間(毫秒)
  transports: ['websocket', 'polling'],
})

// 連接成功
socket.on('connect', () => {
  // 重連時自動加入之前的房間
  if (currentRoom) socket.emit('join:page', currentRoom)
})

// // 重連
// socket.on('reconnect', (attemptNumber) => {
//   console.log('Socket 重新連接成功，嘗試次數:', attemptNumber)
// })

// 連接錯誤
socket.on('connect_error', (error) => {
  console.error('Socket 連接錯誤:', error.message)
})

// 斷線
socket.on('disconnect', (reason) => {
  console.warn('Socket 斷線:', reason)
})

// 加入房間
const joinRoom = (page, userId = null) => {
  currentRoom = [page, userId]
  socket.emit('join:page', currentRoom)
}

export { socket, joinRoom }
