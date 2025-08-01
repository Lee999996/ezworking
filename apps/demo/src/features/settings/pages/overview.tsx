'use client'

import { Button, SimpleGrid } from '@chakra-ui/react'
import { useBilling } from '@saas-ui-pro/billing'
import { Section, SectionBody, SectionHeader } from '@saas-ui-pro/react'
import { PersonaAvatar, Property, PropertyList } from '@saas-ui/react'
import { useQuery } from '@tanstack/react-query'
import {
  FiBox,
  FiBriefcase,
  FiGithub,
  FiHelpCircle,
  FiShield,
} from 'react-icons/fi'

import { getOrganization } from '#api'
import { LinkButton } from '#components/button'
import { SettingsPage } from '#components/settings-page'
import { usePath } from '#features/common/hooks/use-path'
import { useWorkspace } from '#features/common/hooks/use-workspace'
import { FormattedDate } from '#i18n/date-helpers'

import { SettingsCard } from '../components/settings-card'
import { SupportCard } from '../components/support-card'

export function SettingsOverviewPage() {
  const slug = useWorkspace()
  const { data, isLoading } = useQuery({
    queryKey: ['Organization', slug],
    queryFn: () => getOrganization({ slug }),
  })

  const { currentPlan, isTrialing, isCanceled, trialEndsAt, status } =
    useBilling()

  return (
    <SettingsPage
      title="Overview"
      description="Manage your organization settings"
      isLoading={isLoading}
    >
      <Section>
        <SectionHeader title="Organization settings" />
        <SectionBody>
          <SimpleGrid columns={[1, null, 2]} spacing={4}>
            <SettingsCard
              title="Billing"
              description="Manage your subscription."
              icon={FiBriefcase}
              footer={
                <LinkButton href={usePath('/settings/plans')} variant="primary">
                  {isCanceled ? 'Activate your account' : 'Upgrade'}
                </LinkButton>
              }
            >
              <PropertyList borderTopWidth="1px" px="4">
                <Property label="Billing plan" value={currentPlan?.name} />
                {isTrialing ? (
                  <Property
                    label="Trial ends"
                    value={<FormattedDate value={trialEndsAt} />}
                  />
                ) : (
                  <Property label="Status" value={status} />
                )}
              </PropertyList>
            </SettingsCard>
            <SettingsCard
              title="Organization"
              description="Manage your organization details."
              avatar={
                <PersonaAvatar name={data?.organization?.name} size="sm" />
              }
              footer={
                <LinkButton
                  href={usePath('/settings/organization')}
                  variant="secondary"
                >
                  Update
                </LinkButton>
              }
            >
              <PropertyList borderTopWidth="1px" px="4">
                <Property label="Name" value={data?.organization?.name} />
                <Property label="Email" value="hello@saas-ui.dev" />
              </PropertyList>
            </SettingsCard>
          </SimpleGrid>
        </SectionBody>
      </Section>

      <Section>
        <SectionHeader title="Your account" />
        <SectionBody>
          <SimpleGrid columns={[1, null, 2]} spacing={4}>
            <SettingsCard
              title="Security recommendations"
              description="Improve your account security by enabling two-factor
              authentication."
              icon={FiShield}
              footer={
                <Button variant="secondary">
                  Enable two-factor authentication
                </Button>
              }
            />
          </SimpleGrid>
        </SectionBody>
      </Section>

      <Section>
        <SectionHeader title="More" />
        <SectionBody>
          <SimpleGrid columns={[1, null, 3]} spacing={4}>
            <SupportCard
              title="Start guide"
              description="Read how to get started with Saas UI Pro."
              icon={FiHelpCircle}
              href="https://saas-ui.dev/docs/pro/overview"
            />
            <SupportCard
              title="Components"
              description="See all components and how they work."
              icon={FiBox}
              href="https://www.saas-ui.dev/docs/components"
            />
            <SupportCard
              title="Roadmap"
              description="Post feedback, bugs and feature requests."
              icon={FiGithub}
              href="https://roadmap.saas-ui.dev"
            />
          </SimpleGrid>
        </SectionBody>
      </Section>
    </SettingsPage>
  )
}
