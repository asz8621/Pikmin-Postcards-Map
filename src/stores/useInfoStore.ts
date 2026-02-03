import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { userApi } from '@/services'
import type { UserInfo, Feature } from '@/types'

interface ReportType {
  id: number
  code: string
  name: string
  type: string
}

export const useInfoStore = defineStore('info', () => {
  const userData: Ref<UserInfo | null> = ref(null)
  const features: Ref<Feature[]> = ref([])
  const contribute: Ref<any[]> = ref([])
  const reportTypes: Ref<ReportType[]> = ref([])

  const fetchUserData = async () => {
    try {
      const res = await userApi.getUserInfo()
      const { user, types, locations, reportTypes: rpTypes } = res.data.data
      userData.value = user
      features.value = types
      contribute.value = locations
      reportTypes.value = rpTypes.map((item: ReportType) => {
        const type = item.code.split('_')[0]?.toLowerCase() ?? ''
        return { ...item, type }
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const updateFeature = (data: Feature) => {
    const featureIndex = features.value.findIndex((item) => item.id === data.id)
    if (featureIndex !== -1) {
      features.value[featureIndex] = data
    } else {
      features.value = [...features.value, data]
    }
  }

  const removeFeature = (id: number) => {
    features.value = features.value.filter((item) => item.id !== id)
  }

  const setUserData = (data: UserInfo) => {
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
