import { SignInButton } from '@/components/auth/signin-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export default async function SignInPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Anmelden
          </CardTitle>
          <CardDescription>
            Melde dich bei der Family Toolbox an
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignInButton provider="google" className="w-full" />
          
          <div className="text-center text-sm text-gray-600 mt-6">
            Nur für berechtigte Familienmitglieder
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 