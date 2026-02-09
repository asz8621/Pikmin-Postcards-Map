<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/useInfoStore'
import { useMapFilter } from '@/composables/useMapFilter'
import { useLocationForm } from '@/composables/useLocationForm'
import { useLanguage } from '@/composables/useLanguage'

const infoStore = useInfoStore()
const { features } = storeToRefs(infoStore)

const { typeOptions } = useLocationForm()

const { t } = useLanguage()

const { typeFilter, featuresFilter, filterDrawer, applyFilter, resetFilter } = useMapFilter()

const typeFilterTemp = ref<string | null>(null)
const featuresFilterTemp = ref<number[]>([])

watch(
  () => filterDrawer.value,
  (newVal) => {
    if (newVal) {
      typeFilterTemp.value = typeFilter.value
      featuresFilterTemp.value = featuresFilter.value
    }
  },
)

const handleApply = () => {
  typeFilter.value = typeFilterTemp.value
  featuresFilter.value = featuresFilterTemp.value
  applyFilter()
}

const handleReset = () => {
  typeFilterTemp.value = null
  featuresFilterTemp.value = []
  resetFilter()
}
</script>

<template>
  <n-drawer
    v-model:show="filterDrawer"
    :width="300"
    placement="right"
    :auto-focus="false"
    :close-on-esc="false"
    :mask-closable="false"
  >
    <n-drawer-content :title="t('common.filterPostcard')" closable>
      <n-form>
        <n-form-item path="type" :label="t('common.type')">
          <n-select
            v-model:value="typeFilterTemp"
            :options="typeOptions"
            :placeholder="t('validation.requiredType')"
            clearable
          />
        </n-form-item>
        <n-form-item path="features" :label="t('common.features')">
          <n-select
            v-model:value="featuresFilterTemp"
            :options="features"
            label-field="name"
            value-field="id"
            multiple
            filterable
            clearable
            :placeholder="t('validation.requiredFeatures')"
          />
        </n-form-item>
      </n-form>

      <div class="flex gap-2">
        <n-button class="flex-1" @click="handleReset">
          {{ t('common.reset') }}
        </n-button>
        <n-button type="primary" class="flex-1" @click="handleApply">
          {{ t('common.confirm') }}
        </n-button>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<style lang="scss" scoped></style>
