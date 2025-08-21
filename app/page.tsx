'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Vote, ArrowRight, QrCode, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function HomePage() {
  const [sessionCode, setSessionCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode.trim()) {
      setError('Por favor ingresa un código de sesión');
      return;
    }

    setLoading(true);
    setError('');
    
    // Redirigir directamente a la página de votación
    // La validación se hará en esa página
    router.push(`/vote/${sessionCode.trim().toUpperCase()}`);
  };

  const goToAdmin = () => {
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 rounded-full p-3">
              <Vote className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SIVRA</h1>
          <p className="text-gray-600 mt-2">Sistema de Votación en Tiempo Real</p>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Participar en Encuesta</CardTitle>
            <CardDescription>
              Ingresa el código de sesión para comenzar a votar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="sessionCode">Código de Sesión</Label>
                <Input
                  id="sessionCode"
                  type="text"
                  placeholder="Ej: ABC123"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                  className="text-center font-mono text-lg"
                  maxLength={10}
                  autoFocus
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Accediendo...
                  </div>
                ) : (
                  <>
                    Participar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* QR Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <QrCode className="h-6 w-6 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">¿Tienes un código QR?</h3>
                <p className="text-sm text-blue-800">
                  Escanéalo con tu cámara para acceder directamente a la encuesta
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Access */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={goToAdmin}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Acceso Administrativo
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 space-y-1">
          <p>Sistema de Votación Interactiva en Tiempo Real</p>
          <p>Desarrollado para UTEZ - 2025</p>
        </div>
      </div>
    </div>
  );
}
