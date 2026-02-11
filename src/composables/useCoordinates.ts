export function useCoordinates() {
  // 取得經緯度
  const getCoordinates = (input: string) => {
    const [latStr, longStr] = input.split(',')
    const lat = parseFloat(latStr?.trim() || '0')
    const long = parseFloat(longStr?.trim() || '0')

    return { lat, long }
  }

  return {
    getCoordinates,
  }
}
