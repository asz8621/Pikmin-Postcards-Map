import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', () => {
  const selectedData = ref(null)
  const showModal = ref(false)

  const openModal = (data) => {
    selectedData.value = data
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
  }

  return {
    selectedData,
    showModal,
    openModal,
    closeModal,
  }
})
