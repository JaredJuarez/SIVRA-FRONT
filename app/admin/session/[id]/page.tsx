'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Calendar, Clock, Share2, CheckCircle, XCircle, BarChart3, Play, Square } from 'lucide-react';
import { ShareDialog } from '@/components/ShareDialog';
import { BASE_API_URL } from '@/url';

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
  type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT' | null;
  order: number;
  totalVotes: number;
  options?: AdminOption[];
}

// Interfaz para los detalles específicos de una pregunta
interface QuestionTextResponse {
  response: string;
  submittedAt: string;
  voterIdentifier: string;
}

interface QuestionDetailResponse {
  id: number;
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT';
  order: number;
  sessionId: number;
  options?: AdminOption[] | null;
  totalVotes: number;
  textResponses?: QuestionTextResponse[];
  createdAt: string;
  updatedAt: string;
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
      throw error;
    }
  },

  async activateSession(id: number): Promise<AdminSession> {
    try {
      const baseUrl = BASE_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      console.log(`▶️ [ADMIN_SERVICE] Activando sesión: ${id}`);
      console.log(`📡 [ADMIN_SERVICE] Endpoint: ${baseUrl}/admin/sessions/${id}/activate`);
      
      const response = await fetch(`${baseUrl}/admin/sessions/${id}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [ADMIN_SERVICE] Error activando sesión:`, {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ [ADMIN_SERVICE] Sesión ${id} activada exitosamente:`, data);
      return data;
    } catch (error) {
      console.error('❌ [ADMIN_SERVICE] Error activating session:', error);
      throw error;
    }
  },

  async closeSession(id: number): Promise<void> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      console.log(`🔒 [ADMIN_SERVICE] Cerrando sesión ID: ${id}`);
      console.log(`📡 [ADMIN_SERVICE] Endpoint: ${baseUrl}/admin/sessions/${id}/close`);
      
      const response = await fetch(`${baseUrl}/admin/sessions/${id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      console.log(`📡 [ADMIN_SERVICE] Respuesta del servidor:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [ADMIN_SERVICE] Error del servidor:`, {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      console.log(`✅ [ADMIN_SERVICE] Sesión ${id} cerrada exitosamente`);
    } catch (error) {
      console.error('❌ [ADMIN_SERVICE] Error closing session:', error);
      throw error;
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
  
  // Estados para los detalles de la pregunta seleccionada
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [questionDetails, setQuestionDetails] = useState<QuestionDetailResponse | null>(null);
  const [loadingQuestionDetails, setLoadingQuestionDetails] = useState(false);

  // Función para obtener los detalles de una pregunta específica
  const loadQuestionDetails = async (questionId: number) => {
    try {
      setLoadingQuestionDetails(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      console.log(`🔍 [QUESTION_DETAILS] Cargando detalles de pregunta ${questionId}`);
      
      const response = await fetch(`${BASE_API_URL}/sessions/${sessionId}/questions/${questionId}`, {
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
      console.log(`✅ [QUESTION_DETAILS] Detalles cargados:`, data);
      
      setQuestionDetails(data);
      setSelectedQuestionId(questionId);
    } catch (error) {
      console.error('❌ [QUESTION_DETAILS] Error loading question details:', error);
      setError('Error al cargar los detalles de la pregunta');
    } finally {
      setLoadingQuestionDetails(false);
    }
  };

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

  // Función para alternar el estado de la sesión
  const toggleSessionStatus = async (sessionId: number) => {
    try {
      if (!session) return;
      
      // Prevenir modificación si la sesión está cerrada
      if (session.status === 'CLOSED') {
        console.log(`🚫 [ADMIN_DETAIL] Cannot modify closed session ${sessionId}`);
        return;
      }
      
      console.log(`🔄 [ADMIN_DETAIL] Toggling status for session ${sessionId} from ${session.status}`);
      
      let updatedSession: AdminSession;
      
      if (session.status === 'ACTIVE') {
        // Cerrar sesión
        await AdminService.activateSession(sessionId);
        updatedSession = {
          ...session,
          status: 'INACTIVE',
          closedAt: new Date().toISOString()
        };
        console.log(`🔒 [ADMIN_DETAIL] Session ${sessionId} closed successfully`);
      } else {
        // Activar sesión
        updatedSession = await AdminService.activateSession(sessionId);
        console.log(`▶️ [ADMIN_DETAIL] Session ${sessionId} activated successfully`);
      }
      
      setSession(updatedSession);
    } catch (error) {
      console.error('❌ [ADMIN_DETAIL] Error toggling session status:', error);
      // En caso de error, actualizamos localmente para mostrar que la acción se intentó
      if (session && session.status !== 'CLOSED') {
        const newStatus = session.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        setSession({
          ...session,
          status: newStatus,
          [newStatus === 'ACTIVE' ? 'activatedAt' : 'closedAt']: new Date().toISOString()
        });
      }
    }
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
            <p className="text-gray-600 mt-2">
              Detalles de la sesión de votación
              {session.status === 'CLOSED' && (
                <span className="block text-red-600 font-medium mt-1">
                  ⚠️ Esta encuesta está cerrada definitivamente
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            {/* Solo mostrar botón compartir si la sesión NO está cerrada */}
            {session.status !== 'CLOSED' && (
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
            )}
            
            {/* Solo mostrar botón activar/desactivar si la sesión NO está cerrada */}
            {session.status !== 'CLOSED' && (
              <Button
                variant={session.status === "ACTIVE" ? "destructive" : "default"}
                onClick={() => toggleSessionStatus(session.id)}
              >
                {session.status === "ACTIVE" ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Activar
                  </>
                )}
              </Button>
            )}

            {/* Mostrar mensaje informativo cuando esté cerrada */}
            {session.status === 'CLOSED' && (
              <Badge variant="destructive" className="px-4 py-2 text-sm">
                <XCircle className="w-4 h-4 mr-2" />
                Encuesta Cerrada
              </Badge>
            )}
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
                {session.questions?.reduce((total: number, q: AdminQuestion) => total + q.totalVotes, 0) || 0}
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
              <div className="text-2xl font-bold">{session.questions?.length || 0}</div>
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
              ) : session.status === 'CLOSED' ? (
                <XCircle className="h-4 w-4 text-gray-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {session.status === 'ACTIVE' ? 'Activa' : 
                 session.status === 'CLOSED' ? 'Cerrada' : 
                 'Desactivada'}
              </div>
              <p className="text-xs text-muted-foreground">
                {session.status === 'ACTIVE' ? 'Recibiendo votos' : 
                 session.status === 'CLOSED' ? 'Encuesta finalizada definitivamente' : 
                 'Votación desactivada'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Questions and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Preguntas */}
          <Card>
            <CardHeader>
              <CardTitle>Preguntas de la Sesión</CardTitle>
              <CardDescription>
                Haz clic en una pregunta para ver sus detalles completos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {session.questions && session.questions.length > 0 ? (
                session.questions.map((question: AdminQuestion, index: number) => (
                  <div
                    key={question.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedQuestionId === question.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => loadQuestionDetails(question.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {index + 1}. {question.questionText}
                        </h3>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {question.type === 'MULTIPLE_CHOICE' ? 'Opción múltiple' : question.type === 'OPEN_TEXT' ? 'Texto libre' : 'Sin tipo'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {question.totalVotes} voto{question.totalVotes !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      {selectedQuestionId === question.id && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>

                    {/* Vista previa básica para preguntas de opción múltiple */}
                    {question.type === 'MULTIPLE_CHOICE' && question.options && question.options.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {question.options.slice(0, 3).map((option: AdminOption) => {
                          const percentage = question.totalVotes > 0 
                            ? (option.voteCount / question.totalVotes) * 100 
                            : 0;

                          return (
                            <div key={option.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 truncate">{option.optionText}</span>
                              <span className="text-gray-500 ml-2">{percentage.toFixed(0)}%</span>
                            </div>
                          );
                        })}
                        {question.options.length > 3 && (
                          <div className="text-sm text-gray-400">
                            +{question.options.length - 3} opciones más...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay preguntas disponibles</h3>
                  <p className="text-gray-600">Esta sesión aún no tiene preguntas configuradas.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalles de la Pregunta Seleccionada */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Pregunta</CardTitle>
              <CardDescription>
                {selectedQuestionId 
                  ? 'Información detallada y respuestas completas'
                  : 'Selecciona una pregunta para ver sus detalles'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingQuestionDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando detalles...</p>
                  </div>
                </div>
              ) : selectedQuestionId && questionDetails ? (
                <div className="space-y-6">
                  {/* Información básica */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {questionDetails.questionText}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <Badge variant="secondary">
                        {questionDetails.type === 'MULTIPLE_CHOICE' ? 'Opción múltiple' : 'Texto libre'}
                      </Badge>
                      <span>Total de votos: {questionDetails.totalVotes}</span>
                      <span>Orden: {questionDetails.order}</span>
                    </div>
                  </div>

                  {/* Resultados para preguntas de opción múltiple */}
                  {questionDetails.type === 'MULTIPLE_CHOICE' && questionDetails.options && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Resultados por opción</h4>
                      <div className="space-y-3">
                        {questionDetails.options.map((option: AdminOption) => {
                          const percentage = questionDetails.totalVotes > 0 
                            ? (option.voteCount / questionDetails.totalVotes) * 100 
                            : 0;

                          return (
                            <div key={option.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">{option.optionText}</span>
                                <span className="text-sm font-semibold text-gray-700">
                                  {option.voteCount} votos ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <ProgressBar percentage={percentage} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Respuestas de texto libre */}
                  {questionDetails.type === 'OPEN_TEXT' && questionDetails.textResponses && questionDetails.textResponses.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Respuestas de texto ({questionDetails.textResponses.length})
                      </h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {questionDetails.textResponses.map((response, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                            <p className="text-gray-900 mb-2">{response.response}</p>
                            <div className="text-xs text-gray-500 flex items-center gap-3">
                              <span>Por: {response.voterIdentifier}</span>
                              <span>•</span>
                              <span>
                                {new Date(response.submittedAt).toLocaleDateString()} a las {' '}
                                {new Date(response.submittedAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mensaje si no hay respuestas de texto */}
                  {questionDetails.type === 'OPEN_TEXT' && (!questionDetails.textResponses || questionDetails.textResponses.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No hay respuestas de texto para esta pregunta aún.</p>
                    </div>
                  )}

                  {/* Información adicional */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Información adicional</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Creada: {new Date(questionDetails.createdAt).toLocaleString()}</p>
                      <p>Actualizada: {new Date(questionDetails.updatedAt).toLocaleString()}</p>
                      <p>ID de sesión: {questionDetails.sessionId}</p>
                      <p>ID de pregunta: {questionDetails.id}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una pregunta</h3>
                  <p className="text-gray-600">Haz clic en cualquier pregunta de la lista para ver sus detalles completos.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
