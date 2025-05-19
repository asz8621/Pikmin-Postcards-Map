<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import mushroomIcon from '@/assets/images/mushroom.png'
import flowerIcon from '@/assets/images/flower.png'
import questionMark from '@/assets/images/question-mark.png'
import { useModalStore } from '@/stores/modal'
import { useInfoStore } from '@/stores/info'
import EditLocationModal from '@/components/contribute/EditLocationModal.vue'
import DeleteLocationModal from '@/components/contribute/DeleteLocationModal.vue'

const infoStore = useInfoStore()
const { contribute } = storeToRefs(infoStore)

const modalStore = useModalStore()
const { openModal, closeModal } = modalStore
const { modalStates } = storeToRefs(modalStore)

const checkStrategy = ref('all')
const filteredContribute = computed(() => {
  if (checkStrategy.value === 'all') return contribute.value
  return contribute.value.filter((item) => item.image_status === checkStrategy.value)
})

const checkStrategyAlert = computed(() => {
  switch (checkStrategy.value) {
    case 'pending':
      return '人工審核大約 <strong>1~3 天</strong>，請耐心等候，謝謝'
    case 'rejected':
      return '駁回的資料將不定期清除，如果有誤判請盡快重新上傳資料'
    default:
      return ''
  }
})

const getModelIcon = (type) => {
  switch (type) {
    case 'mushroom':
      return mushroomIcon
    case 'flower':
      return flowerIcon
    default:
      return questionMark
  }
}

const statusMap = {
  approved: { text: '已通過', type: 'success' },
  pending: { text: '審核中', type: 'warning' },
  rejected: { text: '駁回', type: 'error' },
}
const getStatusText = (status) => statusMap[status]?.text || '狀態異常'
const getStatusType = (status) => statusMap[status]?.type || 'default'

const onDrawerShowChange = (show) => {
  if (!show) {
    closeModal('contribute')
    checkStrategy.value = 'all'
  }
}
</script>

<template>
  <n-drawer
    v-model:show="modalStates.contribute"
    width="100%"
    placement="right"
    size="small"
    :auto-focus="false"
    :mask-closable="false"
    @update:show="onDrawerShowChange"
  >
    <n-drawer-content title="我的貢獻" closable body-content-class="!p-2 sm:!p-4">
      <n-radio-group v-model:value="checkStrategy" class="flex w-full">
        <n-radio-button value="all" class="flex-1 text-center">全部</n-radio-button>
        <n-radio-button value="approved" class="flex-1 text-center">已通過</n-radio-button>
        <n-radio-button value="pending" class="flex-1 text-center">審核中</n-radio-button>
        <n-radio-button value="rejected" class="flex-1 text-center">駁回</n-radio-button>
      </n-radio-group>

      <n-space v-if="filteredContribute.length > 0" vertical class="my-4">
        <n-alert v-if="checkStrategyAlert" type="warning" :show-icon="false">
          <div v-html="checkStrategyAlert"></div>
        </n-alert>

        <n-card
          v-for="item in filteredContribute"
          :key="item.id"
          class="overflow-hidden"
          content-class="flex flex-wrap flex-col sm:flex-row sm:flex-nowrap !p-0"
        >
          <div class="w-full p-2 sm:p-4">
            <div class="flex items-center">
              <img
                :src="item.image"
                :alt="item.name"
                class="w-[80px] h-[80px] object-cover mr-4 rounded-lg"
              />

              <div>
                <div class="inline-flex items-center">
                  <img
                    :src="getModelIcon(item.type)"
                    :alt="`${item.type}-icon`"
                    class="w-6 h-6 object-cover mr-2"
                  />

                  <strong class="mr-2">{{ item.name }}</strong>

                  <n-tag :type="getStatusType(item.image_status)" :bordered="false" size="small">
                    {{ getStatusText(item.image_status) }}
                  </n-tag>
                </div>

                <div class="text-xs text-gray-400 mb-2">{{ item.country }}, {{ item.city }}</div>

                <div>{{ item.lat }}, {{ item.long }}</div>

                <div v-if="item.rejected_text">
                  <div class="bg-red-100 border border-red-300 text-sm mt-2 p-2 rounded">
                    駁回原因：{{ item.rejected_text }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="item.image_status === 'pending'" class="flex flex-row sm:flex-col">
            <n-button
              secondary
              type="warning"
              class="flex-1 w-full rounded-none"
              @click="openModal('editLocation', item)"
            >
              <template #icon>
                <SvgIcon name="edit" width="36px" height="36px"></SvgIcon>
              </template>
            </n-button>
            <n-button
              secondary
              type="error"
              class="flex-1 w-full rounded-none"
              @click="openModal('deleteLocation', item)"
            >
              <template #icon>
                <SvgIcon name="delete" width="36px" height="36px"></SvgIcon>
              </template>
            </n-button>
          </div>
        </n-card>
      </n-space>

      <n-empty
        v-else
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        description="查無資料"
      />
    </n-drawer-content>

    <EditLocationModal class="w-full xs:w-[520px] m-4 xs:m-auto" />

    <DeleteLocationModal class="w-full xs:w-[420px] m-4 xs:m-auto" />
  </n-drawer>
</template>

<style lang="scss"></style>
