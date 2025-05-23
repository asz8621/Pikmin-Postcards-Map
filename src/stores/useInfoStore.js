import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from '@/plugins/axios'

export const useInfoStore = defineStore('info', () => {
  const userData = ref(null)
  const features = ref([])
  const contribute = ref([])

  const fetchUserData = async () => {
    try {
      const res = await axios.get('/user/info')
      const { user, types, locations } = res.data.data
      userData.value = user
      features.value = types
      contribute.value = locations
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const setUserData = (data) => {
    userData.value = data
  }

  return {
    userData,
    features,
    contribute,
    fetchUserData,
    setUserData,
  }
})
