'use client'

import { SaasProvider } from '@saas-ui/react'
import { AuthProvider } from '@saas-ui/auth'
import { authService } from '@/services/auth'

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
            {children}
          </AuthProvider>
        </SaasProvider>
      </body>
    </html>
  )
} 