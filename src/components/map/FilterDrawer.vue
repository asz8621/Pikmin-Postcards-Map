<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/useInfoStore'
import { useMapFilter } from '@/composables/useMapFilter'
import { useLocationForm } from '@/composables/useLocationForm'

const infoStore = useInfoStore()
const { features } = storeToRefs(infoStore)

const { typeOptions } = useLocationForm()

const { typeFilter, featuresFilter, filterDrawer, applyFilter, resetFilter } = useMapFilter()

const typeFilterTemp = ref(null)
const featuresFilterTemp = ref([])

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
    <n-drawer-content title="篩選明信片" closable>
      <n-form>
        <n-form-item path="type" label="類型">
          <n-select
            v-model:value="typeFilterTemp"
            :options="typeOptions"
            placeholder="選擇類型"
            clearable
          />
        </n-form-item>
        <n-form-item path="features" label="標籤">
          <n-select
            v-model:value="featuresFilterTemp"
            :options="features"
            label-field="name"
            value-field="id"
            multiple
            filterable
            clearable
            placeholder="選擇標籤"
          />
        </n-form-item>
      </n-form>

      <div class="flex gap-2">
        <n-button class="flex-1" @click="handleReset">重置</n-button>
        <n-button type="primary" class="flex-1" @click="handleApply">確認</n-button>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<style lang="scss" scoped></style>
