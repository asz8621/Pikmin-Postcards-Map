import mushroomIcon from '@/assets/images/mushroom.png'
import flowerIcon from '@/assets/images/flower.png'
import questionMark from '@/assets/images/question-mark.png'
import flowerRadarIcon from '@/assets/images/flower-radar.png'

const iconMap = {
  mushroom: mushroomIcon,
  flower: flowerIcon,
}

export const getTypeIcon = (type, explore) => {
  if (type === 'flower' && explore === true) {
    return flowerRadarIcon
  }
  return iconMap[type] || questionMark
}
