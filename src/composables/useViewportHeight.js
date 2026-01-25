import { onMounted, onUnmounted } from 'vue'

// 解決行動裝置上 100vh 高度不準的問題
export function useViewportHeight() {
  const setViewportHeight = () => {
    const height = window.visualViewport?.height || window.innerHeight
    document.documentElement.style.setProperty('--vh', `${height * 0.01}px`)
  }

  onMounted(() => {
    setViewportHeight()

    window.addEventListener('resize', setViewportHeight)
    window.addEventListener('orientationchange', setViewportHeight)
    window.visualViewport?.addEventListener('resize', setViewportHeight)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', setViewportHeight)
    window.removeEventListener('orientationchange', setViewportHeight)
    window.visualViewport?.removeEventListener('resize', setViewportHeight)
  })
}
