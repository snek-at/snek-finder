import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Button,
  useDisclosure,
  ButtonGroup
} from '@chakra-ui/react'
import {useState} from 'react'

interface ImagePreviewWarningAlertProps {
  imageCount: number
  onGeneratePreviews: () => Promise<void>
}

const ImagePreviewWarningAlert: React.FC<ImagePreviewWarningAlertProps> = ({
  imageCount,
  onGeneratePreviews
}) => {
  const {isOpen: isVisible, onClose} = useDisclosure({defaultIsOpen: true})

  const [isLoading, setIsLoading] = useState(false)

  if (!isVisible) {
    return null
  }

  const handleGeneratePreviews = async () => {
    setIsLoading(true)
    await onGeneratePreviews()
    setIsLoading(false)
  }

  return (
    <Alert
      status="warning"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      mb={4}>
      <AlertIcon boxSize={4} mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        Missing Previews for {imageCount} Images
      </AlertTitle>
      <AlertDescription maxWidth="container.lg">
        There are {imageCount} images in your collection that currently lack
        previews. To enhance the browsing experience and facilitate easy
        selection, it is recommended to generate previews for these images.
      </AlertDescription>
      <ButtonGroup mt={4}>
        <Button
          colorScheme="blue"
          onClick={handleGeneratePreviews}
          isLoading={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Previews'}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Remind Me Later
        </Button>
      </ButtonGroup>
      <CloseButton
        position="absolute"
        right="8px"
        top="8px"
        onClick={onClose}
      />
    </Alert>
  )
}

export default ImagePreviewWarningAlert
