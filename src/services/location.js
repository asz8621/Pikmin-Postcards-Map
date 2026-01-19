import axios from '@/plugins/axios'

export const getLocations = () => {
  return axios.get('/user/locations')
}

export const createLocation = (formData, timeout = 30000) => {
  return axios.post('/user/locations', formData, { timeout })
}

export const updateLocation = (locationId, formData) => {
  return axios.put(`/user/locations/${locationId}`, formData)
}

export const deleteLocation = (locationId) => {
  return axios.delete(`/user/locations/${locationId}`)
}

export const searchAddress = (address) => {
  return axios.get(`/user/geocoding/search?address=${address}`)
}
