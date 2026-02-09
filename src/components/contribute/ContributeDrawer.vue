<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useModalStore } from '@/stores/useModalStore'
import { useInfoStore } from '@/stores/useInfoStore'
import EditLocationModal from '@/components/contribute/EditLocationModal.vue'
import DeleteLocationModal from '@/components/contribute/DeleteLocationModal.vue'
import { useSocketEvents } from '@/composables/useSocketEvents'
import { useLanguage } from '@/composables/useLanguage'
import { getTypeIcon } from '@/utils/typeIcon'

const infoStore = useInfoStore()
const { contribute } = storeToRefs(infoStore)

const modalStore = useModalStore()
const { openModal, closeModal } = modalStore
const { modalStates } = storeToRefs(modalStore)

const { useSocketListener, handleUserContribute } = useSocketEvents()

const { t } = useLanguage()

useSocketListener('info', handleUserContribute as (...args: unknown[]) => void)

const checkStrategy = ref('all')
const filteredContribute = computed(() => {
  if (checkStrategy.value === 'all') return contribute.value
  return contribute.value.filter((item) => item.image_status === checkStrategy.value)
})

const checkStrategyAlert = computed(() => {
  switch (checkStrategy.value) {
    case 'pending':
      return t('message.pendingReviewTip')
    case 'rejected':
      return t('message.rejectedDataTip')
    default:
      return ''
  }
})

type ImageStatus = 'approved' | 'pending' | 'rejected'

const statusMap: Record<ImageStatus, { text: string; type: string }> = {
  approved: { text: t('common.approved'), type: 'success' },
  pending: { text: t('common.pending'), type: 'warning' },
  rejected: { text: t('common.rejected'), type: 'error' },
}
const getStatusText = (status: ImageStatus) => statusMap[status]?.text || t('common.statusError')
const getStatusType = (status: ImageStatus) => statusMap[status]?.type || 'default'

const onDrawerShowChange = (show: boolean) => {
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
    <n-drawer-content :title="t('common.myContribute')" closable body-content-class="!p-2 sm:!p-4">
      <n-radio-group v-model:value="checkStrategy" class="flex w-full">
        <n-radio-button value="all" class="flex-1 text-center">
          {{ t('common.all') }}
        </n-radio-button>
        <n-radio-button value="approved" class="flex-1 text-center">
          {{ t('common.approved') }}
        </n-radio-button>
        <n-radio-button value="pending" class="flex-1 text-center">
          {{ t('common.pending') }}
        </n-radio-button>
        <n-radio-button value="rejected" class="flex-1 text-center">
          {{ t('common.rejected') }}
        </n-radio-button>
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
              <n-image
                :src="item.image"
                :alt="item.name"
                preview-disabled
                class="w-[80px] h-[80px] object-cover mr-4 rounded-lg"
                fallback-src="/img-error.png"
              />

              <div>
                <div class="inline-flex items-center">
                  <img
                    :src="getTypeIcon(item.type, item.explore)"
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
                    {{ t('common.rejectedText') }}：{{ item.rejected_text }}
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
        :description="t('common.noData')"
      />
    </n-drawer-content>

    <EditLocationModal class="w-full xs:w-[520px] m-4 xs:mx-auto" />

    <DeleteLocationModal class="w-full xs:w-[420px] m-4 xs:mx-auto" />
  </n-drawer>
</template>

<style lang="scss"></style>
