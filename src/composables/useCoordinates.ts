import { useLanguage } from '@/composables/useLanguage'

export function useCoordinates() {
  const { t } = useLanguage()

  // 座標驗證規則
  const coordsRules = () => ({
    coords: [
      {
        validator: (_: unknown, value: string) => {
          if (!value || value.trim() === '') {
            return new Error(t('validation.requiredCoords'))
          }

          const coordRegex = /^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/
          const match = value?.match(coordRegex)

          if (!match || !match[1] || !match[3]) {
            return new Error(t('validation.invalidCoords'))
          }

          const lat = parseFloat(match[1])
          const long = parseFloat(match[3])

          if (lat < -90 || lat > 90 || long < -180 || long > 180) {
            return new Error(t('validation.outOfRangeCoords'))
          }

          return true
        },
        trigger: 'blur',
      },
    ],
  })

  // 取得經緯度
  const getCoordinates = (input: string) => {
    const [latStr, longStr] = input.split(',')
    const lat = parseFloat(latStr?.trim() || '0')
    const long = parseFloat(longStr?.trim() || '0')

    return { lat, long }
  }

  return {
    coordsRules,
    getCoordinates,
  }
}
