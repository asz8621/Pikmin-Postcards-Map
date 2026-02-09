<script setup lang="ts">
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['facebook-login', 'google-login'])
</script>

<template>
  <div>
    <n-divider style="--n-color: #646464; --n-text-color: #646464" class="!mt-0">
      {{ $t('auth.quickLogin') }}
    </n-divider>

    <div class="flex justify-center items-center gap-6">
      <n-button text :disabled="loading" @click="$emit('facebook-login')">
        <div class="size-9">
          <SvgIcon name="facebook-icon" />
        </div>
      </n-button>

      <n-button text :disabled="loading" @click="$emit('google-login')">
        <div class="size-9">
          <SvgIcon name="google-icon" />
        </div>
      </n-button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
