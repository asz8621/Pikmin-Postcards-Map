import mushroomIcon from '@/assets/images/mushroom.png'
import flowerIcon from '@/assets/images/flower.png'
import questionMark from '@/assets/images/question-mark.png'

const iconMap = {
  mushroom: mushroomIcon,
  flower: flowerIcon,
}

export const getTypeIcon = (type) => {
  return iconMap[type] || questionMark
}
