'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface SignOutButtonProps {
  className?: string
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <Button 
      onClick={handleSignOut}
      variant="ghost"
      className={className}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Abmelden
    </Button>
  )
} 