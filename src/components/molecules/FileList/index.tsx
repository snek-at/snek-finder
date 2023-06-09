import {HStack, Text} from '@chakra-ui/react'
import React from 'react'

import TheTable from './Table'

type FileListItems = {
  prefix: JSX.Element
  name: string
  modifiedAt: string
  fileSize?: string
  isFolder?: boolean
}[]

const prepareData = (items: FileListItems) => {
  return items.map(e => ({
    prefix: e.prefix,
    fileName: e.name,
    fileLastModifiedAt: e.modifiedAt,
    fileSize: e.fileSize || '-',
    isDropzone: e.isFolder
  }))
}

const columns = [
  {
    Header: 'Name',
    accessor: 'fileName',
    width: '80%',
    Cell: ({row}: any) => (
      <HStack>
        {row.original.prefix}
        <Text>{row.original.fileName}</Text>
      </HStack>
    )
  },
  {
    Header: 'Last modified',
    accessor: 'fileLastModifiedAt'
  },
  {
    Header: 'File size',
    accessor: 'fileSize',
    isNumeric: true,
    disableSortBy: true
  }
]

const initialState = {
  sortBy: [
    {
      id: 'fileLastModifiedAt',
      desc: true
    }
  ]
}

export type FileListProps = {
  items: FileListItems
  onDnD: (dragIndex: number, dropIndex: number) => void
  onContextMenu: (event: React.MouseEvent<any>, id?: number) => void
  onContextMenuClose: () => void
  onSelectionDoubleClick: () => void
  onSelectionChange: (ids: number[]) => void
}

const FileList: React.FC<FileListProps> = ({items, ...props}) => {
  return (
    <TheTable
      columns={columns}
      records={prepareData(items)}
      initialState={initialState}
      {...props}
    />
  )
}

export default React.memo(FileList)
