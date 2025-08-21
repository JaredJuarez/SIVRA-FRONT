import { useEffect, useState } from 'react'
import { AuthService } from '@/lib/auth-service'

export function AuthDebugInfo() {
  const [authState, setAuthState] = useState<any>({})

  useEffect(() => {
    const updateState = () => {
      if (typeof window !== 'undefined') {
        setAuthState({
          isAuthenticated: AuthService.isAuthenticated(),
          token: AuthService.getToken(),
          email: AuthService.getUserEmail(),
          localStorage: {
            authToken: localStorage.getItem('authToken'),
            userEmail: localStorage.getItem('userEmail')
          }
        })
      }
    }

    updateState()
    
    // Actualizar cada segundo para ver cambios en tiempo real
    const interval = setInterval(updateState, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg text-xs max-w-md">
      <div className="font-bold mb-2">🐛 Auth Debug Info</div>
      <pre>{JSON.stringify(authState, null, 2)}</pre>
    </div>
  )
}
