<script setup lang="ts">
import LanguageBar from '@/components/LanguageBar.vue'
</script>

<template>
  <div
    class="flex justify-center items-start xs:items-center bg-login bg-center bg-no-repeat bg-cover h-full p-4"
  >
    <div class="relative w-full xs:w-[400px] p-6 bg-green-50/90 rounded-lg shadow-lg select-none">
      <h1 class="relative mb-6">
        <img src="@/assets/images/logo.png" alt="logo" draggable="false" />

        <div class="absolute top-1/2 right-0 transform translate-y-[-50%] cursor-pointer">
          <LanguageBar />
        </div>
      </h1>

      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
