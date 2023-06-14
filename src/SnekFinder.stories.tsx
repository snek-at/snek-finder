import {Box, Button, ButtonGroup, Flex, Input} from '@chakra-ui/react'
import {Meta} from '@storybook/react'
import React from 'react'
import OSGBackend from './backends/OSGBackend'
import {FinderData} from './components/organisms/Finder/types'
import {SnekFinderProvider, useSnekFinderContext} from './SnekFinderProvider'
import {useSnekFinder} from './useSnekFinder'

//> Story without component

const IndexController = () => {
  const {backend} = useSnekFinderContext()

  return (
    <Box>
      <Box>
        <Button
          onClick={async () => {
            alert(JSON.stringify(await backend.uploadIndex()))
          }}>
          Upload Index
        </Button>
      </Box>
    </Box>
  )
}

export default {
  title: 'SnekFinder',
  component: Button,
  decorators: [
    Story => (
      <SnekFinderProvider
        backend={OSGBackend}
        initDataLink="https://osg.snek.at/storage/BQACAgQAAxkDAAIYw2SAUy3T82d6icvxMXW-BuBnBrGpAALsEAACfXIAAVDTYCO5gif6AS8E"
        rootFileId="ae4b3bf8-6ed2-4ac6-bf18-722321af298c">
        <>
          <IndexController />
          <Story />
        </>
      </SnekFinderProvider>
    )
  ],
  parameters: {
    layout: 'fullscreen'
  }
} as Meta

export const ToggleSelector = () => {
  const {finderElement, toggleSelector} = useSnekFinder({
    mode: 'selector'
  })

  return (
    <>
      {finderElement}
      <Button onClick={() => toggleSelector()}>Open</Button>
    </>
  )
}

export const Element = () => {
  const {finderElement} = useSnekFinder({
    mode: 'browser'
  })

  return (
    <Box h="80vh" m={4}>
      {finderElement}
    </Box>
  )
}

export const SmallElement = () => {
  const {finderElement} = useSnekFinder({
    mode: 'browser'
  })

  return <Box h="500px">{finderElement}</Box>
}

export const SnekStudio = () => {
  const {finderElement, toggleSnekStudio} = useSnekFinder({
    mode: 'editor',
    onSnekStudioUpdate: (file, newSrc, editedImageObject) => {
      console.log('onSnekStudioUpdate')
      console.log(file)
      console.log(newSrc)
      console.log(editedImageObject)
    }
  })

  console.log(finderElement)

  return (
    <>
      {finderElement}
      <Button
        onClick={() =>
          toggleSnekStudio(
            'https://fastly.picsum.photos/id/798/536/354.jpg?hmac=G7WN49OaaiBgJFNQzJSajzPX1H_eOGD8eTuvWQlhzVI',
            'test'
          )
        }>
        Open SnekStudio
      </Button>
    </>
  )
}
