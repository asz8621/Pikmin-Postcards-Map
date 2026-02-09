<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMapStore } from '@/stores/useMapStore'
import { useLanguage } from '@/composables/useLanguage'
import { useApiError } from '@/composables/useApiError'
import { errorMsg } from '@/utils/appMessage'

const mapStore = useMapStore()
const { searchAddress: searchAddressAPI } = mapStore
const { isSearch, searchResults } = storeToRefs(mapStore)

const { t } = useLanguage()

const { handleError } = useApiError()

const address = ref('')

const searchAddress = async () => {
  if (address.value.trim() === '') return

  try {
    await searchAddressAPI(address.value)

    // 檢查是否有搜尋結果
    if (!searchResults.value?.result?.place_id) {
      errorMsg(t('message.locationNotFound'))
    }
  } catch (error) {
    handleError(error, t('message.searchFailed'))
  }
}
</script>

<template>
  <div
    class="absolute top-4 left-4 z-10 w-[calc(100%-9rem)] md:w-[480px] mr-auto transition-width duration-500"
  >
    <n-input
      v-model:value="address"
      round
      clearable
      size="large"
      class="searchInput pr-6"
      :placeholder="t('validation.requiredSearch')"
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
