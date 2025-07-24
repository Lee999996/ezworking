import * as React from 'react'

import {
  Button,
  ButtonGroup,
  FormLabel,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/react'
import {
  ArrayFieldAddButton,
  ArrayFieldContainer,
  ArrayFieldRemoveButton,
  ArrayFieldRowContainer,
  ArrayFieldRowFields,
  ArrayFieldRows,
  Form,
  FormLayout,
  SubmitButton,
} from '@saas-ui/react'
import { LuPlus, LuX } from 'react-icons/lu'

export interface InvitePeopleInput {
  invites: {
    email: string
    role: string
  }[]
}

interface InvitePeopleModalProps
  extends Pick<ModalProps, 'isOpen' | 'onClose'> {
  isOpen: boolean
  onSubmit: (data: InvitePeopleInput) => Promise<void>
}

export const InvitePeopleModal: React.FC<InvitePeopleModalProps> = (props) => {
  const { onSubmit, ...modalProps } = props

  const roleOptions = [
    {
      value: 'member',
      label: 'Member',
    },
    {
      value: 'admin',
      label: 'Admin',
    },
  ]

  return (
    <Modal {...modalProps} size="lg">
      <ModalOverlay />
      <ModalContent>
        <Form
          onSubmit={onSubmit}
          defaultValues={{
            invites: [
              {
                email: '',
                role: 'member',
              },
              {
                email: '',
                role: 'member',
              },
              {
                email: '',
                role: 'member',
              },
            ],
          }}
        >
          {({ Field }) => (
            <>
              <ModalHeader>
                <Heading fontSize="lg" fontWeight="medium">
                  Invite people
                </Heading>

                <ModalCloseButton />
              </ModalHeader>
              <ModalBody pb="4">
                <FormLayout
                  columns={3}
                  spacing={1}
                  templateColumns="2fr 1fr"
                  me="10"
                >
                  <FormLabel>Email</FormLabel>
                  <FormLabel>Role</FormLabel>
                </FormLayout>
                <ArrayFieldContainer
                  name="invites"
                  hideLabel
                  defaultValue={{
                    email: '',
                    role: 'member',
                  }}
                  keyName="key"
                  min={2}
                  max={10}
                >
                  <ArrayFieldRows>
                    {(fields) => (
                      <>
                        {fields.map((field, i) => {
                          return (
                            <ArrayFieldRowContainer
                              key={field.key as string}
                              index={i}
                            >
                              <ArrayFieldRowFields
                                columns={3}
                                spacing={1}
                                templateColumns="2fr 1fr"
                              >
                                <Field
                                  name="invites.$.email"
                                  type="email"
                                  placeholder="Email address"
                                />
                                <Field
                                  name="invites.$.role"
                                  type="select"
                                  options={roleOptions}
                                />
                              </ArrayFieldRowFields>
                              <ArrayFieldRemoveButton
                                variant="ghost"
                                alignSelf="center"
                              >
                                <LuX />
                              </ArrayFieldRemoveButton>
                            </ArrayFieldRowContainer>
                          )
                        })}
                      </>
                    )}
                  </ArrayFieldRows>
                  <HStack>
                    <ArrayFieldAddButton
                      variant="outline"
                      colorScheme="primary"
                      alignSelf="flex-start"
                      leftIcon={<LuPlus />}
                    >
                      Add another
                    </ArrayFieldAddButton>
                  </HStack>
                </ArrayFieldContainer>
              </ModalBody>
              <ModalFooter
                bg="gray.100"
                borderBottomRadius="md"
                _dark={{ bg: 'whiteAlpha.100' }}
              >
                <ButtonGroup>
                  <Button variant="ghost">Cancel</Button>
                  <SubmitButton>Invite</SubmitButton>
                </ButtonGroup>
              </ModalFooter>
            </>
          )}
        </Form>
      </ModalContent>
    </Modal>
  )
}
