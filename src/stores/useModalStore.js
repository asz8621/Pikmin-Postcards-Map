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
    uploadLocation: false,
    contribute: false,
    editLocation: false,
    deleteLocation: false,
    userInfo: false,
  })

  const validateErrorMsg = ref('請確認資料是否填寫齊全無誤')

  // 用來開啟指定的 modal
  const openModal = (modalName, data = null) => {
    modalStates.value[modalName] = true
    modalData.value = data
  }

  // 用來關閉指定的 modal
  const closeModal = (modalName) => {
    modalStates.value[modalName] = false
  }

  // 用來關閉所有的 modal
  const closeAllModals = () => {
    Object.keys(modalStates.value).forEach((key) => {
      modalStates.value[key] = false
    })
    modalData.value = null
    modalLoading.value = false
  }

  return {
    modalLoading,
    modalStates,
    modalData,
    validateErrorMsg,
    openModal,
    closeModal,
    closeAllModals,
  }
})
