<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/info'
import { useMapStore } from '@/stores/map'

const infoStore = useInfoStore()
const { fetchUserData } = infoStore
const { userData } = storeToRefs(infoStore)

const mapStore = useMapStore()
const { fetchMapData } = mapStore

const options = [
  {
    label: '我的貢獻',
    key: 'contribute',
  },
  {
    label: '上傳點位',
    key: 'upload',
  },
  {
    label: '修改密碼',
    key: 'changePassword',
  },
  {
    label: '登出',
    key: 'logout',
  },
]

onMounted(async () => {
  await fetchUserData()
  await fetchMapData()
})
</script>

<template>
  <n-layout>
    <n-layout-header bordered class="header">
      <div class="headerContent">
        <div class="logo">logo</div>

        <n-dropdown
          v-if="userData"
          trigger="click"
          placement="bottom-end"
          :options="options"
          @select="handleSelect"
        >
          <n-button icon-placement="right" class="headerMenu">
            {{ userData?.username }}
            <template #icon>
              <SvgIcon name="down"></SvgIcon>
            </template>
          </n-button>
        </n-dropdown>
      </div>
    </n-layout-header>
  </n-layout>
</template>

<style lang="scss">
$headerHeight: 72px;
.header {
  height: $headerHeight;
  padding: 0.5rem 1rem;
  .headerContent {
    display: flex;
    align-items: center;
    height: 100%;
    .headerMenu {
      margin-left: auto;
    }
  }
}
.logo {
  margin-right: auto;
}
</style>
