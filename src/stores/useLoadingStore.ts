import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', () => {
  const isAppLoading: Ref<boolean> = ref(false)

  const openAppLoading = (): void => {
    isAppLoading.value = true
  }

  const closeAppLoading = (): void => {
    isAppLoading.value = false
  }

  return { isAppLoading, openAppLoading, closeAppLoading }
})
