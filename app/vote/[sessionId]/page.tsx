"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useParams } from "next/navigation"
import { Vote, CheckCircle, XCircle, Users } from "lucide-react"

interface VotingSession {
  id: string
  name: string
  status: "draft" | "active" | "closed"
  questions: Array<{
    id: string
    question: string
    options: Array<{ id: string; text: string; votes: number }>
  }>
  createdAt: string
  totalVotes: number
}

export default function VotePage() {
  const [session, setSession] = useState<VotingSession | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [hasVoted, setHasVoted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const params = useParams()
  const sessionId = params.sessionId as string

  useEffect(() => {
    const sessions = JSON.parse(localStorage.getItem("votingSessions") || "[]")
    const foundSession = sessions.find((s: VotingSession) => s.id === sessionId)

    if (foundSession) {
      setSession(foundSession)

      // Verificar si ya votó
      const votedSessions = JSON.parse(localStorage.getItem("userVotes") || "[]")
      if (votedSessions.includes(sessionId)) {
        setHasVoted(true)
      }
    }
  }, [sessionId])

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const submitVote = async () => {
    if (!session) return

    // Verificar que todas las preguntas tengan respuesta
    const unansweredQuestions = session.questions.filter((q) => !answers[q.id])
    if (unansweredQuestions.length > 0) {
      alert("Por favor responde todas las preguntas antes de enviar tu voto")
      return
    }

    setIsSubmitting(true)

    // Simular envío
    setTimeout(() => {
      // Actualizar votos en localStorage
      const sessions = JSON.parse(localStorage.getItem("votingSessions") || "[]")
      const updatedSessions = sessions.map((s: VotingSession) => {
        if (s.id === sessionId) {
          const updatedQuestions = s.questions.map((question) => {
            const selectedOptionId = answers[question.id]
            const updatedOptions = question.options.map((option) =>
              option.id === selectedOptionId ? { ...option, votes: option.votes + 1 } : option,
            )
            return { ...question, options: updatedOptions }
          })
          return {
            ...s,
            questions: updatedQuestions,
            totalVotes: s.totalVotes + 1,
          }
        }
        return s
      })

      localStorage.setItem("votingSessions", JSON.stringify(updatedSessions))

      // Marcar como votado
      const votedSessions = JSON.parse(localStorage.getItem("userVotes") || "[]")
      votedSessions.push(sessionId)
      localStorage.setItem("userVotes", JSON.stringify(votedSessions))

      setIsSubmitting(false)
      setSubmitted(true)
    }, 1500)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sesión no encontrada</h2>
            <p className="text-gray-600 text-center">La sesión de votación que buscas no existe o ha sido eliminada.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (session.status !== "active") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="w-12 h-12 text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sesión no disponible</h2>
            <p className="text-gray-600 text-center">Esta sesión de votación no está activa en este momento.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (hasVoted || submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">¡Gracias por participar!</h2>
            <p className="text-gray-600 text-center mb-4">
              Tu voto ha sido registrado exitosamente en "{session.name}".
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>Solo se permite un voto por sesión</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Vote className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{session.name}</h1>
          <p className="text-gray-600">Responde todas las preguntas para enviar tu voto</p>
        </div>

        <div className="space-y-6">
          {session.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Pregunta {index + 1} de {session.questions.length}
                </CardTitle>
                <CardDescription className="text-base">{question.question}</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[question.id] || ""}
                  onValueChange={(value) => handleAnswerChange(question.id, value)}
                >
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer text-base">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={submitVote}
                disabled={isSubmitting || Object.keys(answers).length !== session.questions.length}
                className="w-full h-12 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Enviando voto...
                  </>
                ) : (
                  <>
                    <Vote className="w-5 h-5 mr-2" />
                    Enviar mi voto
                  </>
                )}
              </Button>

              {Object.keys(answers).length !== session.questions.length && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Responde todas las preguntas para habilitar el envío
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
