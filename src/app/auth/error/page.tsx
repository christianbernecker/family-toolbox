import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-900">
            Anmeldung fehlgeschlagen
          </CardTitle>
          <CardDescription>
            Es ist ein Fehler bei der Anmeldung aufgetreten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            Bitte versuche es erneut oder wende dich an den Administrator.
          </div>
          
          <Link href="/auth/signin">
            <Button className="w-full">
              Erneut versuchen
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