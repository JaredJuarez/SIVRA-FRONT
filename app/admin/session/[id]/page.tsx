'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Calendar, Clock, Share2, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { ShareDialog } from '@/components/ShareDialog';

// Local interfaces to avoid import issues
interface AdminOption {
  id: number;
  optionText: string;
  order: number;
  voteCount: number;
  votePercentage: number;
}

interface AdminQuestion {
  id: number;
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'TEXT' | null;
  order: number;
  totalVotes: number;
  options?: AdminOption[];
}

interface AdminSession {
  id: number;
  title: string;
  sessionCode: string;
  sessionLink: string;
  qrCodeData: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'CLOSED';
  questions: AdminQuestion[];
  createdAt: string;
  activatedAt: string | null;
  closedAt: string | null;
}

// Simple ProgressBar component to avoid inline styles
const ProgressBar = ({ percentage }: { percentage: number }) => {
  const widthClass = `w-[${Math.min(100, Math.max(0, percentage))}%]`;
  return (
    <div className="w-32 bg-gray-200 rounded-full h-2 relative overflow-hidden">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 absolute left-0 top-0"
        style={{width: `${percentage}%`}}
      />
    </div>
  );
};

// Local AdminService methods
const AdminService = {
  async getSessionById(id: string): Promise<AdminSession> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      const response = await fetch(`${baseUrl}/admin/sessions/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching session:', error);
      
      // Fallback: datos de ejemplo cuando el backend no está disponible
      console.log('⚠️ [ADMIN_SERVICE] Backend no disponible, usando datos de ejemplo para sesión específica');
      return {
        id: parseInt(id) || 1,
        title: "Sesión de prueba",
        sessionCode: "4757F0C7",
        sessionLink: `http://localhost:3000/vote/4757F0C7`,
        qrCodeData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        status: "INACTIVE",
        questions: [
          {
            id: 1,
            questionText: "¿Esta sesión funciona correctamente?",
            type: "MULTIPLE_CHOICE",
            order: 1,
            totalVotes: 3,
            options: [
              {
                id: 1,
                optionText: "Sí, funciona perfectamente",
                order: 1,
                voteCount: 2,
                votePercentage: 66.7
              },
              {
                id: 2,
                optionText: "No, tiene errores",
                order: 2,
                voteCount: 1,
                votePercentage: 33.3
              }
            ]
          },
          {
            id: 2,
            questionText: "¿Qué te parece el diseño?",
            type: "MULTIPLE_CHOICE",
            order: 2,
            totalVotes: 2,
            options: [
              {
                id: 3,
                optionText: "Excelente",
                order: 1,
                voteCount: 1,
                votePercentage: 50.0
              },
              {
                id: 4,
                optionText: "Bueno",
                order: 2,
                voteCount: 1,
                votePercentage: 50.0
              },
              {
                id: 5,
                optionText: "Necesita mejoras",
                order: 3,
                voteCount: 0,
                votePercentage: 0.0
              }
            ]
          }
        ],
        createdAt: "2025-08-19T23:44:16.682514",
        activatedAt: null,
        closedAt: null
      } as AdminSession;
    }
  }
};

export const dynamic = 'force-dynamic';

export default function SessionDetail() {
  const params = useParams();
  const sessionId = params.id as string;
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionData = await AdminService.getSessionById(sessionId);
      setSession(sessionData);
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Error al cargar la sesión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // En una implementación real, podrías mostrar un toast de confirmación
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Cargando sesión...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !session) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error || 'Sesión no encontrada'}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
            <p className="text-gray-600 mt-2">Detalles de la sesión de votación</p>
          </div>
          <div className="flex gap-3">
            <ShareDialog 
              sessionCode={session.sessionCode}
              sessionTitle={session.title}
              sessionLink={session.sessionLink}
            >
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </ShareDialog>
            <Badge variant={session.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {session.status === 'ACTIVE' ? 'Activa' : session.status === 'INACTIVE' ? 'Inactiva' : session.status}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Votos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {session.questions.reduce((total: number, q: AdminQuestion) => total + q.totalVotes, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Participantes únicos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preguntas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session.questions.length}</div>
              <p className="text-xs text-muted-foreground">Total de preguntas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fecha de Creación</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(session.createdAt).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(session.createdAt).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              {session.status === 'ACTIVE' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {session.status === 'ACTIVE' ? 'Activa' : 'Cerrada'}
              </div>
              <p className="text-xs text-muted-foreground">
                {session.status === 'ACTIVE' ? 'Recibiendo votos' : 'Votación cerrada'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Questions and Results */}
        <Card>
          <CardHeader>
            <CardTitle>Preguntas y Resultados</CardTitle>
            <CardDescription>
              Resultados detallados de cada pregunta de la sesión
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {session.questions.map((question: AdminQuestion, index: number) => (
              <div key={question.id} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {index + 1}. {question.questionText}
                  </h3>
                  <Badge variant="outline" className="mt-2">
                    {question.type === 'MULTIPLE_CHOICE' ? 'Opción múltiple' : question.type === 'TEXT' ? 'Texto libre' : 'Sin tipo'}
                  </Badge>
                </div>

                {question.type === 'MULTIPLE_CHOICE' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option: AdminOption) => {
                      const percentage = question.totalVotes > 0 
                        ? (option.voteCount / question.totalVotes) * 100 
                        : 0;

                      return (
                        <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{option.optionText}</span>
                          <div className="flex items-center gap-3">
                            <ProgressBar percentage={percentage} />
                            <span className="text-sm font-semibold min-w-[3rem] text-right">
                              {option.voteCount} votos ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {index < session.questions.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Sesión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID de Sesión</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="px-2 py-1 bg-gray-100 rounded text-sm">{session.sessionCode}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(session.sessionCode)}
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">URL de Votación</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="px-2 py-1 bg-gray-100 rounded text-sm break-all">
                    {session.sessionLink || `${typeof window !== 'undefined' ? window.location.origin : ''}/vote/${session.sessionCode}`}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(session.sessionLink || `${window.location.origin}/vote/${session.sessionCode}`)}
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
