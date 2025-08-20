'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle, CheckCircle, Users, Clock, Vote, Send, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VoteService, VoteSession, VoteQuestion, VoteRequest } from '@/lib/VoteService';

export const dynamic = 'force-dynamic';

export default function VotingPage() {
  const params = useParams();
  const router = useRouter();
  const sessionCode = params.sessionCode as string;
  
  const [session, setSession] = useState<VoteSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [votes, setVotes] = useState<Record<number, any>>({});
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [voterFingerprint, setVoterFingerprint] = useState('');
  const [userRegistered, setUserRegistered] = useState(false);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionData = await VoteService.getVotingSession(sessionCode);
      setSession(sessionData);
      
      // Generar fingerprint del votante
      const fingerprint = VoteService.generateVoterFingerprint();
      setVoterFingerprint(fingerprint);
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Sesión no encontrada o no está activa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionCode) {
      loadSession();
    }
  }, [sessionCode]);

  const handleVoteChange = (questionId: number, value: any) => {
    setVotes(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const registerUser = () => {
    if (!username.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }
    setError(null);
    setUserRegistered(true);
  };

  const submitCurrentQuestionVote = async () => {
    if (!session || !userRegistered) return;
    
    const currentQuestion = session.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const currentVote = votes[currentQuestion.id];
    if (!currentVote) {
      setError('Por favor selecciona una respuesta');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const voteRequest: VoteRequest = {
        username: username.trim(),
        voterFingerprint: voterFingerprint,
        ...(currentQuestion.type === 'MULTIPLE_CHOICE' 
          ? { optionId: parseInt(currentVote) }
          : { textResponse: currentVote }
        )
      };

      console.log(`🗳️ [VOTE] Enviando voto para pregunta ${currentQuestion.id}:`, voteRequest);

      // Usar el endpoint específico para preguntas individuales
      await VoteService.submitQuestionVote(sessionCode, currentQuestion.id, voteRequest);
      
      console.log(`✅ [VOTE] Voto enviado exitosamente para pregunta ${currentQuestion.id}`);

      // Si es la última pregunta, marcar como completado
      if (currentQuestionIndex === session.questions.length - 1) {
        setSubmitted(true);
      } else {
        // Avanzar a la siguiente pregunta automáticamente
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }

    } catch (err) {
      console.error('❌ [VOTE] Error submitting vote:', err);
      setError('Error al enviar el voto. Por favor intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const goToQuestion = (index: number) => {
    if (session && session.questions && index >= 0 && index < session.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const nextQuestion = () => {
    if (session && session.questions && currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Cargando sesión de votación...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pantalla de error
  if (error && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Error de Sesión</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadSession} className="w-full mb-2">
              Reintentar
            </Button>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pantalla de éxito
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-800">¡Gracias!</CardTitle>
            <CardDescription>
              Tu participación ha sido registrada exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">{username}</p>
              <p className="text-green-600 text-sm">
                Has completado todas las preguntas de la encuesta
              </p>
            </div>
            <div>
              <Button onClick={() => router.push('/')} className="w-full">
                Finalizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) return null;

  // Validar que la sesión tenga preguntas
  if (!session.questions || session.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <CardTitle>Sin Preguntas Disponibles</CardTitle>
            <CardDescription>
              Esta sesión no tiene preguntas configuradas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];

  // Validar que la pregunta actual existe
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Error de Pregunta</CardTitle>
            <CardDescription>
              No se pudo cargar la pregunta actual. Índice: {currentQuestionIndex}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setCurrentQuestionIndex(0)} className="w-full mb-2">
              Ir a Primera Pregunta
            </Button>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {!userRegistered ? (
          // Pantalla de registro de usuario
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-900">{session.title}</CardTitle>
                <CardDescription>
                  Bienvenido a esta sesión de votación. Por favor ingresa tu nombre para comenzar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Vote className="h-4 w-4" />
                      <span>Código: {session.sessionCode}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{session.questions.length} preguntas</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="username">Tu nombre</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && registerUser()}
                    className="mt-1"
                    autoFocus
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={registerUser}
                  disabled={!username.trim()}
                  className="w-full"
                >
                  Comenzar Votación
                </Button>

                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Volver al inicio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Pantalla de votación
          <>
            {/* Header */}
            <Card className="mb-6">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-900">{session.title}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Vote className="h-4 w-4" />
                    <span>Código: {session.sessionCode}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Votante: {username}</span>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Progress */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Progreso de la encuesta</h3>
                  <span className="text-sm text-gray-500">
                    {currentQuestionIndex + 1} de {session.questions.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{width: `${Math.round(((currentQuestionIndex + 1) / session.questions.length) * 100)}%`}}
                  />
                </div>

                {/* Question Navigator */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {session.questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(index)}
                      className={`
                        w-8 h-8 rounded-full text-sm font-medium transition-colors
                        ${index === currentQuestionIndex 
                          ? 'bg-indigo-600 text-white' 
                          : votes[q.id] 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Question */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  Pregunta {currentQuestionIndex + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {currentQuestion.questionText}
                    </h3>
                    <Badge variant="outline">
                      {currentQuestion.type === 'MULTIPLE_CHOICE' ? 'Opción múltiple' : 'Respuesta libre'}
                    </Badge>
                  </div>

                  {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options ? (
                    <RadioGroup
                      value={votes[currentQuestion.id]?.toString() || ''}
                      onValueChange={(value) => handleVoteChange(currentQuestion.id, value)}
                    >
                      <div className="space-y-3">
                        {currentQuestion.options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value={option.id.toString()} 
                              id={`option-${option.id}`}
                            />
                            <Label 
                              htmlFor={`option-${option.id}`}
                              className="text-base font-normal cursor-pointer flex-1 py-2"
                            >
                              {option.optionText}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  ) : (
                    <div>
                      <Label htmlFor="textResponse">Tu respuesta</Label>
                      <Textarea
                        id="textResponse"
                        placeholder="Escribe tu respuesta aquí..."
                        value={votes[currentQuestion.id] || ''}
                        onChange={(e) => handleVoteChange(currentQuestion.id, e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {error && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Navigation */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <Button
                    onClick={prevQuestion}
                    variant="outline"
                    disabled={currentQuestionIndex === 0}
                    className="w-full sm:w-auto"
                  >
                    Anterior
                  </Button>

                  <div className="text-center text-sm text-gray-500">
                    {Object.keys(votes).length} de {session.questions.length} respondidas
                  </div>

                  {currentQuestionIndex === session.questions.length - 1 ? (
                    <Button
                      onClick={submitCurrentQuestionVote}
                      disabled={!votes[currentQuestion.id] || submitting}
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Send className="h-4 w-4" />
                      {submitting ? 'Enviando...' : 'Finalizar Encuesta'}
                    </Button>
                  ) : (
                    <Button
                      onClick={submitCurrentQuestionVote}
                      disabled={!votes[currentQuestion.id] || submitting}
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      {submitting ? 'Enviando...' : 'Siguiente'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
