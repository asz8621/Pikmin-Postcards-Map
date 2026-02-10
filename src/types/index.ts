export interface LoginData {
  account: string
  password: string
}

export interface RegisterData {
  username: string
  account: string
  email: string
  password: string
}

export interface ForgotPasswordData {
  account: string
  email: string
}

export interface ResetPasswordData {
  token: string
  email: string
  account: string
  password: string
}

export interface PasswordData {
  passwordOld: string
  password: string
}

export interface UserInfo {
  id?: number
  username?: string
  email?: string
  avatar?: string
}

export interface LocationData {
  id: number
  name: string
  type: string
  lat: number
  long: number
  city: string
  country: string
  image: string
  explore: boolean
  features: { id: number; name: string }[]
  image_status: string
  rejected_text: string | null
  time_zone: string
  username: string
}

export interface Feature {
  id: number
  name: string
}

export interface ReportData {
  description: string
  user_id: number
  report_types_id: number
  location_id?: number
}

export interface SearchResult {
  result?: {
    place_id?: string
    location: {
      lat: number
      lng: number
    }
    viewport?: {
      northeast: {
        lat: number
        lng: number
      }
      southwest: {
        lat: number
        lng: number
      }
    }
  }
}

export type ModalName =
  | 'postcard'
  | 'resetPassword'
  | 'uploadLocation'
  | 'contribute'
  | 'editLocation'
  | 'deleteLocation'
  | 'userInfo'
  | 'reportError'

export interface ModalStates {
  postcard: boolean
  resetPassword: boolean
  uploadLocation: boolean
  contribute: boolean
  editLocation: boolean
  deleteLocation: boolean
  userInfo: boolean
  reportError: boolean
}
