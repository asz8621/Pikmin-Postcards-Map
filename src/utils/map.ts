import mushroomIcon from '@/assets/images/mushroom.png'
import flowerIcon from '@/assets/images/flower.png'
import questionMark from '@/assets/images/question-mark.png'
import flowerRadarIcon from '@/assets/images/flower-radar.png'

const iconMap: Record<string, string> = {
  mushroom: mushroomIcon,
  flower: flowerIcon,
}

// 根據類型取得對應的圖示
export const getTypeIcon = (type: string, explore?: boolean): string => {
  if (type === 'flower' && explore === true) {
    return flowerRadarIcon
  }
  return iconMap[type] || questionMark
}

// 取得經緯度
export const getCoordinates = (input: string) => {
  const [latStr, longStr] = input.split(',')
  const lat = parseFloat(latStr?.trim() || '0')
  const long = parseFloat(longStr?.trim() || '0')

  return { lat, long }
}
