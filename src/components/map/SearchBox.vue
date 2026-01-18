<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMapStore } from '@/stores/useMapStore'
import { errorMsg } from '@/utils/appMessage'

const mapStore = useMapStore()
const { searchAddress: searchAddressAPI } = mapStore
const { isSearch, searchResults } = storeToRefs(mapStore)

const address = ref('')

const searchAddress = async () => {
  if (address.value.trim() === '') return

  try {
    await searchAddressAPI(address.value)

    // 檢查是否有搜尋結果
    if (!searchResults.value?.result?.place_id) {
      errorMsg('未找到相符的地點')
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || '搜尋失敗，請稍後再試'
    if (Array.isArray(errorMessage)) {
      errorMessage.forEach((msg) => errorMsg(msg))
    } else {
      errorMsg(errorMessage)
    }
  }
}
</script>

<template>
  <div
    class="absolute top-4 left-4 z-10 w-[calc(100%-5rem)] sm:w-[calc(100%-6rem)] md:w-[320px] mr-auto transition-width duration-500"
  >
    <n-input
      v-model:value="address"
      round
      clearable
      size="large"
      class="searchInput pr-6"
      placeholder="地址、國家、座標"
      @keyup.enter="searchAddress"
    >
      <template #clear-icon>
        <SvgIcon name="clear"></SvgIcon>
      </template>
    </n-input>
    <n-button
      text
      class="absolute top-1/2 right-2 -translate-y-1/2 p-0 size-8"
      circle
      type="primary"
      @click="searchAddress"
    >
      <template #icon>
        <SvgIcon :name="isSearch ? 'loading' : 'search'"></SvgIcon>
      </template>
    </n-button>
  </div>
</template>

<style lang="scss" scoped>
.searchInput :deep(.n-input__suffix) {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
</style>
