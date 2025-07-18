import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-900">
            Zugriff verweigert
          </CardTitle>
          <CardDescription>
            Dein Google-Konto ist nicht für die Family Toolbox autorisiert.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            Bitte stelle sicher, dass du mit einem autorisierten Google-Konto angemeldet bist,
            oder wende dich an den Administrator, um Zugriff zu erhalten.
          </div>
          
          <Link href="/auth/signin">
            <Button className="w-full">
              Mit einem anderen Konto anmelden
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              Zur Startseite
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
} 