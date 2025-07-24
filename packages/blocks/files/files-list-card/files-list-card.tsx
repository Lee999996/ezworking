import React from 'react'

import {
  Card,
  CardBody,
  CardHeader,
  Center,
  HStack,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  IconBadge,
  StructuredList,
  StructuredListCell,
  StructuredListItem,
} from '@saas-ui/react'
import {
  FaFile,
  FaFileImage,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
} from 'react-icons/fa6'
import { FiMoreVertical } from 'react-icons/fi'

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

export type FilesListProps = {
  name: string
  type: string
  previewUrl?: string
  color?: string
  size?: string
  modifiedAt?: string
}

export const FilesListItem: React.FC<FilesListProps> = (props) => {
  return (
    <StructuredListItem onClick={() => null}>
      <StructuredListCell>
        <IconBadge color={props.color}>{getIcon(props.type)}</IconBadge>
      </StructuredListCell>
      <StructuredListCell flex="1">
        <HStack spacing="3" alignItems="flex-start">
          <VStack alignItems="flex-start" spacing="0" lineHeight="1.4">
            <Heading as="h4" size="sm" fontWeight="normal">
              {props.name}
            </Heading>
            <Text color="muted" fontSize="sm">
              {props.size} • {props.modifiedAt}
            </Text>
          </VStack>
        </HStack>
      </StructuredListCell>
      <StructuredListCell>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="File options"
            variant="ghost"
            icon={<FiMoreVertical />}
          />
          <MenuList>
            <MenuItem>Delete</MenuItem>
          </MenuList>
        </Menu>
      </StructuredListCell>
    </StructuredListItem>
  )
}

export const FilesList = (props: { files: FilesListProps[] }) => {
  return (
    <Card>
      <CardHeader borderBottomWidth="1px">
        <Heading as="h3" size="sm" fontWeight="medium">
          Your files
        </Heading>
      </CardHeader>
      <CardBody p="0">
        <StructuredList pb="0">
          {props.files.map((file, i) => (
            <FilesListItem key={i} {...file} />
          ))}
          <StructuredListItem
            bg="gray.50"
            _dark={{
              bg: 'gray.700',
            }}
            borderBottomRadius="md"
            mt="2"
            onClick={() => null}
          >
            <Center w="full">See all files</Center>
          </StructuredListItem>
        </StructuredList>
      </CardBody>
    </Card>
  )
}
