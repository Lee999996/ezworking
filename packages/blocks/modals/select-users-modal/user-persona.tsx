import {
  Persona,
  PersonaAvatar,
  PersonaDetails,
  PersonaLabel,
  type PersonaProps,
  PersonaSecondaryLabel,
} from '@saas-ui/react'

export interface UserPersonaProps extends PersonaProps {
  email: string
}

export const UserPersona: React.FC<UserPersonaProps> = (props) => {
  const { src, name, email, presence, ...rest } = props
  return (
    <Persona {...rest}>
      <PersonaAvatar
        name={name}
        src={src}
        presence={presence}
        size="sm"
        sx={{
          '.chakra-avatar__badge': {
            _dark: {
              '--avatar-border-color': 'var(--chakra-colors-gray-700)',
            },
          },
        }}
      />
      <PersonaDetails>
        <PersonaLabel>{name}</PersonaLabel>
        <PersonaSecondaryLabel>{email}</PersonaSecondaryLabel>
      </PersonaDetails>
    </Persona>
  )
}
