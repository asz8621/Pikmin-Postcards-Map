export function useCoordinates() {
  // 座標驗證規則
  const coordsRules = () => ({
    coords: [
      {
        validator: (_: unknown, value: string) => {
          if (!value || value.trim() === '') {
            return new Error('請輸入座標')
          }

          const coordRegex = /^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/
          const match = value?.match(coordRegex)

          if (!match || !match[1] || !match[3]) {
            return new Error('座標格式錯誤，請輸入例如：2.3425245, 34.23523552')
          }

          const lat = parseFloat(match[1])
          const long = parseFloat(match[3])

          if (lat < -90 || lat > 90 || long < -180 || long > 180) {
            return new Error('經緯度超出合理範圍 (緯度 -90~90, 經度 -180~180)')
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
    const lat = parseFloat(latStr.trim() || '0')
    const long = parseFloat(longStr.trim() || '0')

    return { lat, long }
  }

  return {
    coordsRules,
    getCoordinates,
  }
}
