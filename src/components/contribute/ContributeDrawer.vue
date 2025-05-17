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
const getStatusText = (status) => {
  switch (status) {
    case 'approved':
      return '已通過'
    case 'pending':
      return '審核中'
    case 'rejected':
      return '駁回'
    default:
      return '狀態異常'
  }
}
const getStatusType = (status) => {
  switch (status) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'error'
    default:
      return 'default'
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
    :close-on-esc="false"
    :mask-closable="false"
  >
    <n-drawer-content title="我的貢獻" closable body-content-class="drawerContent">
      <n-radio-group v-model:value="checkStrategy" style="display: flex; width: 100%">
        <n-radio-button value="all" style="flex: 1; text-align: center">全部</n-radio-button>
        <n-radio-button value="approved" style="flex: 1; text-align: center">已通過</n-radio-button>
        <n-radio-button value="pending" style="flex: 1; text-align: center">審核中</n-radio-button>
        <n-radio-button value="rejected" style="flex: 1; text-align: center">駁回</n-radio-button>
      </n-radio-group>

      <n-space vertical v-if="filteredContribute.length > 0" style="margin: 1rem 0">
        <n-alert v-if="checkStrategyAlert" type="warning" :show-icon="false">
          <div v-html="checkStrategyAlert"></div>
        </n-alert>

        <n-card v-for="item in filteredContribute" :key="item.id" content-class="cardContent">
          <div class="cardContentInfo">
            <div style="display: flex; align-items: center">
              <!-- 左邊圖片 -->
              <img
                :src="item.image"
                alt="image"
                style="
                  width: 80px;
                  height: 80px;
                  object-fit: cover;
                  margin-right: 16px;
                  border-radius: 8px;
                "
              />

              <!-- 右邊資訊 -->
              <div>
                <div style="display: inline-flex; align-items: center">
                  <img
                    :src="getModelIcon(item.type)"
                    alt="image"
                    width="24"
                    height="24"
                    style="object-fit: cover; margin-right: 8px"
                  />
                  <strong style="margin-right: 8px">{{ item.name }}</strong>
                  <n-tag :bordered="false" :type="getStatusType(item.image_status)" size="small">{{
                    getStatusText(item.image_status)
                  }}</n-tag>
                </div>
                <div>{{ item.country }}, {{ item.city }}</div>
                <div>{{ item.lat }}, {{ item.long }}</div>
                <div v-if="item.rejected_text">
                  <n-text type="error">原因：{{ item.rejected_text }}</n-text>
                </div>
              </div>
            </div>
          </div>
          <div class="cardContentOperate">
            <n-button strong secondary type="warning" @click="openModal('editLocation', item)">
              <template #icon>
                <SvgIcon name="edit" width="36px" height="36px"></SvgIcon>
              </template>
            </n-button>
            <n-button strong secondary type="error" @click="openModal('deleteLocation', item)">
              <template #icon>
                <SvgIcon name="delete" width="36px" height="36px"></SvgIcon>
              </template>
            </n-button>
          </div>
        </n-card>
      </n-space>

      <n-empty
        v-else
        description="查無資料"
        style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)"
      />
      <template #footer>
        <n-button @click="closeModal('contribute')">關閉</n-button>
      </template>
    </n-drawer-content>

    <EditLocationModal />

    <DeleteLocationModal />
  </n-drawer>
</template>

<style lang="scss">
.drawerContent {
  padding: 1rem !important;
  @media screen and (max-width: 768px) {
    padding: 0.5rem !important;
  }
}
.cardContent {
  padding: 0 !important;
  display: flex;
  flex-wrap: nowrap;
  @media screen and (max-width: 768px) {
    flex-direction: column;
    flex-wrap: wrap;
  }
}
.cardContentInfo {
  padding: 0.75rem 1rem !important;
  width: 100%;
  @media screen and (max-width: 768px) {
    padding: 0.5rem !important;
  }
}
.cardContentOperate {
  display: flex;
  flex-direction: column;
  @media screen and (max-width: 768px) {
    flex-direction: row;
  }
  button {
    width: 100%;
    flex: 1;
  }
}
</style>
