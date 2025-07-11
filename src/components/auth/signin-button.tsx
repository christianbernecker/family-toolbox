'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Github, Mail } from 'lucide-react'

interface SignInButtonProps {
  provider: 'google' | 'apple'
  className?: string
}

export function SignInButton({ provider, className }: SignInButtonProps) {
  const handleSignIn = () => {
    signIn(provider, { callbackUrl: '/dashboard' })
  }

  return (
    <Button 
      onClick={handleSignIn}
      variant="outline"
      className={className}
    >
      {provider === 'google' ? (
        <>
          <Mail className="mr-2 h-4 w-4" />
          Mit Google anmelden
        </>
      ) : (
        <>
          <Github className="mr-2 h-4 w-4" />
          Mit Apple anmelden
        </>
      )}
    </Button>
  )
} 