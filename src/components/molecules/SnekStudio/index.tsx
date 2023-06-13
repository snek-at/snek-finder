//@ts-ignore
import React from 'react'
import FilerobotImageEditor, {TABS} from 'react-filerobot-image-editor'

export type SavedImageData = {
  name: string
  extension: string
  mimeType: string
  fullName?: string
  height?: number
  width?: number
  imageBase64?: string
  imageCanvas?: HTMLCanvasElement // doesn't support quality
  quality?: number
  cloudimageUrl?: string
}

export type SnekStudioProps = {
  src: string
  name: string
  isOpen: boolean
  /**
   * Called when the editor should be closed with saving the editing state
   */
  onComplete(file: Blob | null, editedImageObject: SavedImageData): void

  /**
   * Called when the editor should be closed without saving the editing state
   */
  shouldClose(): void
}

const SnekStudio: React.FC<SnekStudioProps> = ({
  src,
  name,
  isOpen,
  onComplete,
  shouldClose
}) => {
  if (!isOpen) {
    return null
  }

  return (
    <FilerobotImageEditor
      defaultSavedImageName={name}
      showBackButton
      closeAfterSave
      savingPixelRatio={0}
      previewPixelRatio={0}
      source={src}
      onSave={(editedImageObject, designState) => {
        const {imageBase64, imageCanvas} = editedImageObject

        if (imageCanvas && imageBase64) {
          imageCanvas.toBlob(blob => {
            onComplete(blob, editedImageObject)
          })
        }
      }}
      onClose={shouldClose}
      annotationsCommon={{
        fill: '#ff0000'
      }}
      Text={{text: 'Text...'}}
      tabsIds={[
        TABS.RESIZE,
        TABS.ADJUST,
        TABS.FILTERS,
        TABS.FINETUNE,
        TABS.ANNOTATE,
        TABS.WATERMARK
      ]}
    />
  )
}

export default SnekStudio
