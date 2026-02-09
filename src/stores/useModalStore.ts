import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { ModalName, ModalStates } from '@/types'

export const useModalStore = defineStore('modal', () => {
  const modalLoading = ref(false)
  // 如果需要共用選擇的資料
  const modalData: Ref<any> = ref(null)
  // 用物件來管理不同 modal 的顯示狀態
  const modalStates: Ref<ModalStates> = ref({
    postcard: false,
    resetPassword: false,
    uploadLocation: false,
    contribute: false,
    editLocation: false,
    deleteLocation: false,
    userInfo: false,
    reportError: false,
  })

  // 用來開啟指定的 modal
  const openModal = (modalName: ModalName, data: any = null) => {
    modalStates.value[modalName] = true
    if (modalName !== 'reportError') modalData.value = data
  }

  // 用來關閉指定的 modal
  const closeModal = (modalName: ModalName) => {
    modalStates.value[modalName] = false
    if (modalName !== 'reportError') modalData.value = null
  }

  // 用來關閉所有的 modal
  const closeAllModals = () => {
    Object.keys(modalStates.value).forEach((key) => {
      modalStates.value[key as ModalName] = false
    })
    modalData.value = null
    modalLoading.value = false
  }

  return {
    modalLoading,
    modalStates,
    modalData,
    openModal,
    closeModal,
    closeAllModals,
  }
})
