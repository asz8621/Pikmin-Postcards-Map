import { ref } from 'vue'
import { defineStore } from 'pinia'
import { userApi } from '@/services'

export const useInfoStore = defineStore('info', () => {
  const userData = ref(null)
  const features = ref([])
  const contribute = ref([])
  const reportTypes = ref([])

  const fetchUserData = async () => {
    try {
      const res = await userApi.getUserInfo()
      const { user, types, locations, reportTypes: rpTypes } = res.data.data
      userData.value = user
      features.value = types
      contribute.value = locations
      reportTypes.value = rpTypes.map((item) => {
        const type = item.code.split('_')[0].toLowerCase()
        return { ...item, type }
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const updateFeature = (data) => {
    const featureIndex = features.value.findIndex((item) => item.id === data.id)
    if (featureIndex !== -1) {
      features.value[featureIndex] = data
    } else {
      features.value = [...features.value, data]
    }
  }

  const removeFeature = (id) => {
    features.value = features.value.filter((item) => item.id !== id)
  }

  const setUserData = (data) => {
    userData.value = data
  }

  return {
    userData,
    features,
    contribute,
    reportTypes,
    fetchUserData,
    updateFeature,
    removeFeature,
    setUserData,
  }
})
