<script setup lang="ts">
import { h } from 'vue'
import type { VNode } from 'vue'
import { useLanguage, type CountryOptions } from '@/composables/useLanguage'

type RenderOptionProps = {
  node: VNode
  option: CountryOptions
}
type RenderOption = (props: RenderOptionProps) => VNode

const { locale, changeLocale, countryOptions } = useLanguage()

const renderLabel = (option: CountryOptions): VNode => {
  return h(
    'div',
    {
      class: 'dropdown-label',
    },
    [h('span', { class: ['langFlag', option.value] }), option.label],
  )
}

const renderOption: RenderOption = ({ node, option }) => {
  const isActive = option.value === locale.value
  return h(
    'div',
    {
      class: ['lang-dropdown-option', { 'is-active': isActive }],
    },
    [node],
  )
}
</script>

<template>
  <n-dropdown
    trigger="click"
    key-field="value"
    placement="bottom-end"
    :options="countryOptions"
    :render-label="renderLabel"
    :render-option="renderOption"
    @select="changeLocale"
  >
    <div class="langFlag" :class="locale"></div>
  </n-dropdown>
</template>

<style lang="scss">
.langFlag {
  display: inline-block;
  width: 36px;
  height: 24px;
  background-image: url('@/assets/images/css_sprites.png');
  background-repeat: no-repeat;
  background-size: 36px 96px;
  border-radius: 4px;
  vertical-align: middle;
  border: 1px solid #c4c4c4;

  &.zh-TW {
    background-position: 0px 0px;
  }
  &.ja {
    background-position: 0px -24px;
  }
  &.ko {
    background-position: 0px -48px;
  }
  &.en {
    background-position: 0px -72px;
  }
}

.lang-dropdown-option {
  padding: 0 8px;
  cursor: pointer;

  .dropdown-label {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-start;
  }

  &:hover {
    background-color: rgba(211, 164, 82, 0.25) !important;
  }

  // 選中 + hover，背景保持 primary 顏色
  &.is-active,
  &.is-active:hover,
  &.is-active.n-dropdown-option-body--pending {
    background-color: #d3a452 !important;
  }

  // 隱藏 NaiveUI 的 prefix 和 suffix
  .n-dropdown-option-body__prefix,
  .n-dropdown-option-body__suffix {
    display: none !important;
  }
  // 移除 NaiveUI 的 option-body 的 before 元素
  .n-dropdown-option-body {
    &::before {
      content: none !important;
    }
  }
}
</style>
