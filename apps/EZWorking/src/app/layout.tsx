'use client'

import { SaasProvider } from '@saas-ui/react'
import { AuthProvider } from '@saas-ui/auth'
import { authService } from '@/services/auth'
import { ErrorProvider } from '@/contexts/error-context'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SaasProvider>
          <AuthProvider {...authService}>
            <ErrorProvider>
              {children}
            </ErrorProvider>
          </AuthProvider>
        </SaasProvider>
      </body>
    </html>
  )
} 