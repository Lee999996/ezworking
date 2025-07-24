import {
  AspectRatio,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  HStack,
  Heading,
  Icon,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { IconBadge } from '@saas-ui/react'
import {
  FaFile,
  FaFileImage,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
} from 'react-icons/fa6'
import { FiFile, FiMoreHorizontal } from 'react-icons/fi'

const getIcon = (type: string) => {
  switch (type) {
    case 'image':
      return <FaFileImage />
    case 'document':
      return <FaFileWord />
    case 'powerpoint':
      return <FaFilePowerpoint />
    case 'pdf':
      return <FaFilePdf />
    default:
      return <FaFile />
  }
}

export type FileCardProps = {
  name: string
  type: string
  previewUrl?: string
  icon: React.ReactNode
  color?: string
  size?: string
  modifiedAt?: string
}

export const FileCard: React.FC<FileCardProps> = (props) => {
  return (
    <Card role="group" position="relative">
      <CardHeader position="absolute" top="0" right="0" zIndex="1">
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="View options"
            variant="solid"
            colorScheme="gray"
            boxShadow="sm"
            borderWidth="1px"
            display="none"
            _groupHover={{ display: 'flex' }}
            icon={<FiMoreHorizontal />}
          />
          <MenuList>
            <MenuItem>Delete</MenuItem>
          </MenuList>
        </Menu>
      </CardHeader>
      <CardBody
        borderTopRadius="md"
        p="0"
        bg="gray.100"
        _dark={{ bg: 'gray.800' }}
        position="relative"
        overflow="hidden"
      >
        <AspectRatio ratio={16 / 9} bg="">
          {props.previewUrl ? (
            <Image src={props.previewUrl} />
          ) : (
            <Center>
              <Icon as={FiFile} boxSize="12" color="muted" />
            </Center>
          )}
        </AspectRatio>
      </CardBody>
      <CardFooter>
        <HStack spacing="3" alignItems="flex-start">
          <IconBadge color={props.color}>{getIcon(props.type)}</IconBadge>

          <VStack alignItems="flex-start" spacing="0" lineHeight="1.4">
            <Heading as="h4" size="sm" fontWeight="regular">
              {props.name}
            </Heading>
            <Text color="muted" fontSize="sm">
              {props.size} • {props.modifiedAt}
            </Text>
          </VStack>
        </HStack>
      </CardFooter>
    </Card>
  )
}

export const FileCards = (props: { files: FileCardProps[] }) => {
  return (
    <SimpleGrid columns={3} spacing="4">
      {props.files.map((file, i) => (
        <FileCard key={`${file.name}_${i}`} {...file} />
      ))}
    </SimpleGrid>
  )
}
