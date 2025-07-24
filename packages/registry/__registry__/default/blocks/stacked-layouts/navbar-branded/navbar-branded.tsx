import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
} from '@chakra-ui/react'
import { SaasUIIcon } from '@saas-ui/assets'
import {
  AppShell,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarLink,
  PersonaAvatar,
} from '@saas-ui/react'
import { LuBell } from 'react-icons/lu'

export const NavbarBranded: React.FC<React.PropsWithChildren> = (props) => {
  return (
    <AppShell
      variant="static"
      height="480px"
      navbar={
        <Navbar position="sticky" colorScheme="primary">
          <NavbarBrand>
            <SaasUIIcon width="24px" color="currentColor" />
          </NavbarBrand>
          <NavbarContent display={{ base: 'hidden', sm: 'flex' }}>
            <NavbarItem>
              <NavbarLink href="#">Inbox</NavbarLink>
            </NavbarItem>
            <NavbarItem>
              <NavbarLink isActive href="#">
                Contacts
              </NavbarLink>
            </NavbarItem>
            <NavbarItem>
              <NavbarLink href="#">Tasks</NavbarLink>
            </NavbarItem>
          </NavbarContent>
          <NavbarContent as="div" justifyContent="end" spacing="2">
            <NavbarItem>
              <NavbarLink href="#">Help</NavbarLink>
            </NavbarItem>
            <NavbarItem>
              <IconButton
                variant="outline"
                isRound
                aria-label="Notifications"
                size="xs"
                _hover={{
                  bgColor: 'sidebar-on-muted',
                }}
                _active={{
                  bgColor: 'sidebar-on-subtle',
                }}
              >
                <LuBell size="1.2em" />
              </IconButton>
            </NavbarItem>
            <Menu>
              <MenuButton>
                <PersonaAvatar
                  src="/showcase-avatar.jpg"
                  name="Beatriz"
                  size="xs"
                  presence="online"
                />
              </MenuButton>
              <MenuList color="chakra-body-text">
                <MenuGroup title="beatriz@saas-ui.dev">
                  <MenuItem>Profile</MenuItem>
                  <MenuItem>Settings</MenuItem>
                  <MenuItem>Help &amp; feedback</MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuItem>Log out</MenuItem>
              </MenuList>
            </Menu>
          </NavbarContent>
        </Navbar>
      }
    >
      {props.children}
    </AppShell>
  )
}
