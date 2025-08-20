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
import { AlertCircle, CheckCircle, Users, Clock, Vote, Send } from 'lucide-react';
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

  const submitVote = async () => {
    if (!session || !username.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Enviar votos para cada pregunta
      for (const question of session.questions) {
        const vote = votes[question.id];
        if (!vote) continue;

        const voteRequest: VoteRequest = {
          username: username.trim(),
          voterFingerprint: voterFingerprint,
          ...(question.type === 'MULTIPLE_CHOICE' 
            ? { optionId: parseInt(vote) }
            : { textResponse: vote }
          )
        };

        await VoteService.submitQuestionVote(sessionCode, question.id, voteRequest);
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting vote:', err);
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

  const isAllQuestionsAnswered = () => {
    if (!session || !session.questions || session.questions.length === 0) return false;
    return session.questions.every(q => votes[q.id] !== undefined && votes[q.id] !== '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando encuesta...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sesión no encontrada</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.push('/')} variant="outline">
                Ir al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Voto enviado!</h2>
              <p className="text-gray-600 mb-4">
                Gracias por participar en la encuesta "{session?.title}"
              </p>
              <Button onClick={() => router.push('/')} variant="outline">
                Finalizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) return null;

  if (session.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sesión no activa</h2>
              <p className="text-gray-600 mb-4">
                Esta encuesta no está disponible en este momento.
              </p>
              <Badge variant="secondary" className="mb-4">
                Estado: {session.status}
              </Badge>
              <div>
                <Button onClick={() => router.push('/')} variant="outline">
                  Ir al inicio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Validar que la sesión tenga preguntas y que el índice sea válido
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
                <span>{session.questions.reduce((total, q) => total + q.totalVotes, 0)} participantes</span>
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
            <div className="flex justify-between mt-2">
              {session.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    index === currentQuestionIndex 
                      ? 'bg-indigo-600 text-white' 
                      : votes[session.questions[index].id] 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        {!username && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Información del participante</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Tu nombre</Label>
                  <Input
                    id="username"
                    placeholder="Ingresa tu nombre"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Anterior
              </Button>

              <div className="text-sm text-gray-500">
                {Object.keys(votes).length} de {session.questions.length} respondidas
              </div>

              {currentQuestionIndex === session.questions.length - 1 ? (
                <Button
                  onClick={submitVote}
                  disabled={!username.trim() || !isAllQuestionsAnswered() || submitting}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Enviando...' : 'Enviar respuestas'}
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex >= session.questions.length - 1}
                >
                  Siguiente
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
