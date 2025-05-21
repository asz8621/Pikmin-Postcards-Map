import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', () => {
  const isAppLoading = ref(false)

  const openAppLoading = () => {
    isAppLoading.value = true
  }

  const closeAppLoading = () => {
    isAppLoading.value = false
  }

  return { isAppLoading, openAppLoading, closeAppLoading }
})
