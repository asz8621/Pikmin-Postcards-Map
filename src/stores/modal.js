import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', () => {
  const modalLoading = ref(false)
  // 如果需要共用選擇的資料
  const modalData = ref(null)
  // 用物件來管理不同 modal 的顯示狀態
  const modalStates = ref({
    postcard: false,
    resetPassword: false,
  })

  // 用來開啟指定的 modal
  const openModal = (modalName, data = null) => {
    modalStates.value[modalName] = true
    modalData.value = data
  }

  // 用來關閉指定的 modal
  const closeModal = (modalName) => {
    modalStates.value[modalName] = false
  }

  return {
    modalLoading,
    modalStates,
    modalData,
    openModal,
    closeModal,
  }
})
