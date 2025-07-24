'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@saas-ui/auth'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  return <>{children}</>
} 