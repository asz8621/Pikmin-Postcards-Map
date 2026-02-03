import axios from '@/plugins/axios'
import type { ReportData } from '@/types'

export const getLocations = () => {
  return axios.get('/user/locations')
}

export const createLocation = (formData: FormData, timeout = 30000) => {
  return axios.post('/user/locations', formData, { timeout })
}

export const updateLocation = (locationId: number, formData: FormData) => {
  return axios.put(`/user/locations/${locationId}`, formData)
}

export const deleteLocation = (locationId: number) => {
  return axios.delete(`/user/locations/${locationId}`)
}

export const searchAddress = (address: string) => {
  return axios.get(`/user/geocoding/search?address=${address}`)
}

export const reportError = (data: ReportData) => {
  return axios.post('/user/reports', data)
}
