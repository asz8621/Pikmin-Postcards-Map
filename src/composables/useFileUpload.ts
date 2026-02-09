import type { UploadFileInfo } from 'naive-ui'
import { errorMsg } from '@/utils/appMessage'
import { useLanguage } from '@/composables/useLanguage'

interface FileUploadOptions {
  maxSizeMB?: number
  allowedTypes?: string[]
  maxImageSize?: number
  jpegQuality?: number
}

interface UploadFile extends UploadFileInfo {
  size: number
}

// 檔案上傳與處理相關的 composable
export const useFileUpload = (options: FileUploadOptions = {}) => {
  const { t } = useLanguage()

  const {
    maxSizeMB = 5,
    allowedTypes = ['image/png', 'image/jpeg'],
    maxImageSize = 1500, // 圖片壓縮的最大尺寸
    jpegQuality = 0.85, // JPEG 壓縮品質
  } = options

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  // 圖片驗證規則
  const imageFileRules = (imageUrl?: string) => ({
    imageFile: [
      {
        key: 'imageFile',
        required: true,
        validator: (_: unknown, value: UploadFile) => {
          const result = validateImageFile(value, imageUrl)
          return result
        },
        trigger: ['change', 'blur'],
      },
    ],
  })

  // 檢查檔案格式與大小
  const validateImageFile = (file: UploadFile, imageUrl?: string): true | Error => {
    if (!file && imageUrl) return true // 沒重新上傳不驗證(編輯用)

    if (!file) {
      return new Error(t('message.uploadImage'))
    }

    const { size, type, name } = file

    if (!name || !type) {
      return new Error(t('message.fileInfoError'))
    }

    if (!allowedTypes.includes(type)) {
      return new Error(t('message.invalidFileType'))
    }

    if (size > maxSizeBytes) {
      return new Error(t('message.fileSizeExceeded', { maxSizeMB }))
    }

    return true
  }

  // 上傳前驗證`
  const beforeUpload = (uploadData: { file: UploadFileInfo }) => {
    const file = uploadData?.file?.file as File | undefined

    if (!file) {
      errorMsg(t('message.fileInfoError'))
      return false
    }

    const fileData = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    } as UploadFile

    const result = validateImageFile(fileData, undefined)

    if (result instanceof Error) {
      errorMsg(result.message)
      return false
    }

    return true
  }

  // 縮放並轉換圖片為 JPG
  const resizeAndConvertToJPG = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = () => {
        img.src = reader.result as string
      }

      img.onload = () => {
        let { width, height } = img

        // 計算等比例縮放
        if (width > maxImageSize || height > maxImageSize) {
          const scale = Math.min(maxImageSize / width, maxImageSize / height)
          width = width * scale
          height = height * scale
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(t('message.canvasError'))

        // 背景改白色（防止 PNG 透明變黑）
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, width, height)

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(t('message.conversionFailed'))
            const newFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
              type: 'image/jpeg',
            })
            resolve(newFile)
          },
          'image/jpeg',
          jpegQuality,
        )
      }

      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })
  }

  // FormData 處理
  const buildFormData = async (data: Record<string, any>) => {
    const formData = new FormData()

    for (const [key, value] of Object.entries(data)) {
      if (key === 'imageFile' && value) {
        const compressedFile = await resizeAndConvertToJPG(value as File)
        formData.append('imageFile', compressedFile)
      } else if (value !== null && value !== undefined) {
        formData.append(key, value as string)
      }
    }

    return formData
  }

  return {
    imageFileRules,
    beforeUpload,
    buildFormData,
  }
}
