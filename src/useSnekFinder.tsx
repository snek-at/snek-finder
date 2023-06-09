import * as React from 'react'

import Finder from './components/organisms/Finder'
import {
  FinderData,
  FinderFileItem,
  FinderFolderItem,
  FinderMode
} from './components/organisms/Finder/types'
import ImageViewer from './components/organisms/ImageViewer'
import {useSnekFinderContext} from './SnekFinderProvider'
import SnekStudio, {SavedImageData} from './components/molecules/SnekStudio'
import {Box, Modal, ModalContent, ModalOverlay} from '@chakra-ui/react'

export interface IUseSnekFinderArgs {
  mode: FinderMode
  onSelect?: (file: FinderFileItem) => void
  onSnekStudioUpdate?: (
    file: File,
    newSrc: string,
    editedImageObject: SavedImageData
  ) => void
}

export interface IUseSnekFinder {
  finderElement: JSX.Element
  toggleSelector: () => void
  toggleSelectorPreview: (fileId: string) => void
  toggleSnekStudio: (src: string, name: string) => void
}

export const useSnekFinder = ({
  mode,
  ...props
}: IUseSnekFinderArgs): IUseSnekFinder => {
  const {backend, initData, rootFileId} = useSnekFinderContext()

  const [isSelectorOpen, setIsSelectorOpen] = React.useState(false)
  const [data, setData] = React.useState(initData)

  React.useEffect(() => {
    setData(initData)
  }, [initData])

  React.useEffect(() => {
    const fn = async () => {
      const index = await backend.readIndex()

      // check if data is different from index

      const newData = index || initData

      const isDataDifferent = JSON.stringify(newData) !== JSON.stringify(data)

      if (isDataDifferent) {
        setData(newData)
      }
    }

    fn()
  }, [isSelectorOpen])

  const [openFile, setOpenFile] = React.useState<{
    fileId?: string
    src?: string
    name?: string
    previewType: 'IMAGE_VIEWER' | 'PDF_VIEWER' | 'SNEK_STUDIO'
  } | null>(null)

  const openedFileItem = React.useMemo(() => {
    if (!openFile || !openFile.fileId) {
      return null
    }

    const {fileId} = openFile

    const item = data[fileId]

    if (!item) {
      return null
    } else if ((item as any).isFolder) {
      return null
    }

    return item as FinderFileItem
  }, [openFile, data])

  const handleDataChange = React.useCallback(
    async (newData: object) => {
      await backend.writeIndex(newData)

      setData(newData as FinderData)
    },
    [backend]
  )

  const handleFileOpen = React.useCallback(
    (fileId: string) => {
      const file = data[fileId]

      if (!(file as FinderFolderItem).isFolder) {
        const {mimeType} = file as FinderFileItem
        if (mimeType && mimeType.startsWith('image/')) {
          setOpenFile({fileId, previewType: 'IMAGE_VIEWER'})
        } else if (mimeType && mimeType.startsWith('application/pdf')) {
          setOpenFile({fileId, previewType: 'PDF_VIEWER'})
        }
      }
    },
    [data, setOpenFile]
  )

  const toggleSnekStudio = React.useCallback(
    (src: string, name: string) => {
      setOpenFile(null)
      setIsSelectorOpen(false)
      setOpenFile({fileId: '', previewType: 'SNEK_STUDIO', src, name})
    },
    [setOpenFile, isSelectorOpen, setIsSelectorOpen]
  )

  const handleFinderClose = React.useCallback(() => {
    setOpenFile(null)
    setIsSelectorOpen(false)
  }, [setOpenFile, isSelectorOpen, setIsSelectorOpen])

  const toggleSelector = React.useCallback(() => {
    setIsSelectorOpen(!isSelectorOpen)
  }, [isSelectorOpen, setIsSelectorOpen])

  const toggleSelectorPreview = React.useCallback(
    (fileId: string) => {
      toggleSelector()
      handleFileOpen(fileId)
    },
    [toggleSelector]
  )

  const toggleSelectorSelect = React.useCallback(
    (_: string, file: FinderFileItem) => {
      props.onSelect && props.onSelect(file)
      toggleSelector()
    },
    [toggleSelector]
  )

  console.log(openFile)

  const finderElement = (
    <>
      {openFile && (
        <>
          {openedFileItem &&
            openFile.previewType === 'IMAGE_VIEWER' &&
            openFile.fileId && (
              <ImageViewer
                src={openedFileItem.src}
                name={openedFileItem.name}
                onUpdate={async (
                  blob,
                  {fullName, imageBase64, extension, mimeType}
                ) => {
                  const fileId = openFile.fileId!

                  setData(data => {
                    if (fullName) {
                      return {
                        ...data,
                        [fileId]: {
                          ...data[fileId],
                          src: imageBase64!,
                          name: fullName
                        }
                      }
                    } else {
                      return {
                        ...data,
                        [fileId]: {
                          ...data[fileId],
                          src: imageBase64!
                        }
                      }
                    }
                  })

                  // upload blob to backend
                  if (blob) {
                    const uploaded = await backend.upload(
                      new File([blob], openedFileItem.name, {
                        type: mimeType
                      })
                    )

                    setData(data => {
                      const newData = {
                        ...data,
                        [fileId]: {
                          ...data[fileId],
                          src: uploaded.src,
                          previewSrc: uploaded.previewSrc
                        }
                      }

                      backend.writeIndex(newData)

                      return newData
                    })
                  }
                }}
                onClose={() => setOpenFile(null)}
              />
            )}

          {openFile.previewType === 'SNEK_STUDIO' && (
            <Modal isOpen={true} onClose={() => setOpenFile(null)} size="full">
              <ModalOverlay />
              <ModalContent rounded="none" my="8" boxSize="full">
                <SnekStudio
                  isOpen={true}
                  src={openFile.src!}
                  name={openFile.name!}
                  shouldClose={() => setOpenFile(null)}
                  onComplete={async (blob, editedImageObject) => {
                    if (!blob) {
                      throw new Error('blob is required')
                    }

                    const file = new File(
                      [blob],
                      editedImageObject.fullName || editedImageObject.name,
                      {
                        type: editedImageObject.mimeType
                      }
                    )

                    const uploaded = await backend.upload(file)

                    props.onSnekStudioUpdate &&
                      props.onSnekStudioUpdate(
                        file,
                        uploaded.src,
                        editedImageObject
                      )

                    setOpenFile(null)
                  }}
                />
              </ModalContent>
            </Modal>
          )}

          {/* {openFile.previewType === 'PDF_VIEWER' && (
            <PdfViewer
              src={openedFileItem.src}
              overlay
              toolbar
              onClose={() => setOpenFile(null)}
            />
          )} */}
        </>
      )}
      {!(mode === 'selector' && !isSelectorOpen) && mode !== 'editor' && (
        <Finder
          data={data}
          mode={mode}
          rootUUID={rootFileId}
          onItemOpen={handleFileOpen}
          onDataChanged={handleDataChange}
          onSelectorClose={handleFinderClose}
          onSelectorSelect={toggleSelectorSelect}
          onUploadFile={backend.upload}
        />
      )}
    </>
  )

  return {
    finderElement,
    toggleSelector,
    toggleSelectorPreview,
    toggleSnekStudio
  }
}
