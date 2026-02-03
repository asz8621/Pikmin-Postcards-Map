<script setup lang="ts"></script>

<template>
  <div
    class="flex justify-center items-start xs:items-center bg-login bg-center bg-no-repeat bg-cover h-full p-4"
  >
    <div class="w-full xs:w-[400px] p-6 bg-green-50/90 rounded-lg shadow-lg select-none">
      <h1 class="mb-6">
        <img src="@/assets/images/logo.png" alt="logo" class="mx-auto" draggable="false" />
      </h1>

      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
