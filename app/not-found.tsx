import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" icon={Home}>
              Go Home
            </Button>
          </Link>
          <Button size="lg" variant="outline" icon={ArrowLeft} onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}

