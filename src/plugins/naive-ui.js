import {
  create,
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NButton,
  NSelect,
  NInput,
  NSwitch,
  NUpload,
  NIcon,
  NDrawer,
  NDrawerContent,
} from 'naive-ui'

export const naive = create({
  components: [
    NConfigProvider,
    NMessageProvider,
    NDialogProvider,
    NButton,
    NSelect,
    NInput,
    NSwitch,
    NUpload,
    NIcon,
    NDrawer,
    NDrawerContent,
  ],
})
