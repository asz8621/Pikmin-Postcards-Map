import mushroomIcon from '@/assets/images/mushroom.png'
import flowerIcon from '@/assets/images/flower.png'
import questionMark from '@/assets/images/question-mark.png'
import flowerRadarIcon from '@/assets/images/flower-radar.png'

const iconMap: Record<string, string> = {
  mushroom: mushroomIcon,
  flower: flowerIcon,
}

export const getTypeIcon = (type: string, explore?: boolean): string => {
  if (type === 'flower' && explore === true) {
    return flowerRadarIcon
  }
  return iconMap[type] || questionMark
}
