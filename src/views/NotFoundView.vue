<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="relative min-h-screen bg-notFound bg-cover bg-no-repeat bg-center">
    <div class="absolute inset-0 bg-black opacity-60"></div>

    <div
      class="relative transform translate-y-[50%] sm:translate-y-[25%] text-center text-white z-10"
    >
      <h1
        class="text-6xl sm:text-9xl font-extrabold !leading-normal transition-[font-size] duration-500 mb-4"
      >
        <n-text type="primary" class="nosifer-regular">4 0 4</n-text>
      </h1>
      <n-button type="primary" class="font-bold btn-responsive" @click="goHome">
        回到首頁
      </n-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Nosifer&display=swap');
.nosifer-regular {
  font-family: 'Nosifer', sans-serif;
  font-weight: 400;
  font-style: normal;
}

:deep(.btn-responsive) {
  .n-button__content {
    font-size: 0.875rem;

    @media (min-width: 576px) {
      font-size: 1rem;
    }
  }
}
</style>
