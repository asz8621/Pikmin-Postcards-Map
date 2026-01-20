import { errorMsg } from '@/utils/appMessage'

// 檔案上傳與處理相關的 composable
export const useFileUpload = (options = {}) => {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/png', 'image/jpeg'],
    maxImageSize = 1500, // 圖片壓縮的最大尺寸
    jpegQuality = 0.85, // JPEG 壓縮品質
  } = options

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  // 圖片驗證規則
  const imageFileRules = () => ({
    imageFile: [
      {
        key: 'imageFile',
        required: true,
        validator: (_, value) => {
          const result = validateImageFile(value)
          return result
        },
        trigger: ['change', 'blur'],
      },
    ],
  })

  // 檢查檔案格式與大小
  const validateImageFile = (file) => {
    if (!file) {
      return new Error('請上傳圖片')
    }

    const { size, type, name } = file

    if (!name || !type) {
      return new Error('檔案資訊錯誤')
    }

    if (!allowedTypes.includes(type)) {
      return new Error('只能上傳 PNG 或 JPG 圖片')
    }

    if (size > maxSizeBytes) {
      return new Error(`圖片大小不可超過 ${maxSizeMB}MB`)
    }

    return true
  }

  // 上傳前驗證
  const beforeUpload = (uploadData) => {
    const file = uploadData.file.file
    const fileData = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    }

    const result = validateImageFile(fileData)

    if (result instanceof Error) {
      errorMsg(result.message)
      return false
    }

    return true
  }

  // 縮放並轉換圖片為 JPG
  const resizeAndConvertToJPG = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = () => {
        img.src = reader.result
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
        if (!ctx) return reject('無法取得畫布上下文')

        // 背景改白色（防止 PNG 透明變黑）
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, width, height)

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject('轉換失敗')
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
  const buildFormData = async (data) => {
    const formData = new FormData()

    for (const [key, value] of Object.entries(data)) {
      if (key === 'imageFile' && value) {
        const compressedFile = await resizeAndConvertToJPG(value)
        formData.append('imageFile', compressedFile)
      } else {
        formData.append(key, value)
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
