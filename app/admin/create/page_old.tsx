"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Save, AlertCircle } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { AdminService } from "@/lib/admin-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreateSessionRequest, CreateQuestionRequest } from "@/lib/api"

interface QuestionForm {
  id: string
  questionText: string
  type: 'MULTIPLE_CHOICE' | 'TEXT'
  options: Array<{ id: string; optionText: string }>
}

export default function CreateSession() {
  const [sessionTitle, setSessionTitle] = useState("")
  const [sessionDescription, setSessionDescription] = useState("")
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      id: "1",
      questionText: "",
      type: 'MULTIPLE_CHOICE',
      options: [
        { id: "1", optionText: "" },
        { id: "2", optionText: "" },
      ],
    },
  ])
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const addQuestion = () => {
    const newQuestion: QuestionForm = {
      id: Date.now().toString(),
      questionText: "",
      type: 'MULTIPLE_CHOICE',
      options: [
        { id: Date.now().toString() + "1", optionText: "" },
        { id: Date.now().toString() + "2", optionText: "" },
      ],
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== questionId))
    }
  }

  const updateQuestion = (questionId: string, newQuestion: string) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, question: newQuestion } : q)))
  }

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [
                ...q.options,
                {
                  id: Date.now().toString(),
                  text: "",
                  votes: 0,
                },
              ],
            }
          : q,
      ),
    )
  }

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId && q.options.length > 2 ? { ...q, options: q.options.filter((o) => o.id !== optionId) } : q,
      ),
    )
  }

  const updateOption = (questionId: string, optionId: string, newText: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) => (o.id === optionId ? { ...o, text: newText } : o)),
            }
          : q,
      ),
    )
  }

  const saveSession = () => {
    if (!sessionName.trim()) {
      return
    }

    const hasEmptyQuestions = questions.some((q) => !q.question.trim())
    if (hasEmptyQuestions) {
      return
    }

    const hasEmptyOptions = questions.some((q) => q.options.some((o) => !o.text.trim()))
    if (hasEmptyOptions) {
      return
    }

    const newSession = {
      id: Date.now().toString(),
      name: sessionName,
      status: "draft" as const,
      questions,
      createdAt: new Date().toISOString(),
      totalVotes: 0,
    }

    const existingSessions = JSON.parse(localStorage.getItem("votingSessions") || "[]")
    const updatedSessions = [...existingSessions, newSession]
    localStorage.setItem("votingSessions", JSON.stringify(updatedSessions))

    router.push("/admin/dashboard")
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Sesión</h1>
          <p className="text-gray-600">Configura tu sesión de votación</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Sesión</CardTitle>
            <CardDescription>Ingresa los detalles básicos de tu sesión de votación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sessionName">Nombre de la Sesión</Label>
                <Input
                  id="sessionName"
                  placeholder="Ej: Votación Conferencia Tech 2024"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Preguntas</h2>
            <Button onClick={addQuestion} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Pregunta
            </Button>
          </div>

          {questions.map((question, questionIndex) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Pregunta {questionIndex + 1}</CardTitle>
                  {questions.length > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeQuestion(question.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Pregunta</Label>
                  <Textarea
                    placeholder="Escribe tu pregunta aquí..."
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Opciones de respuesta</Label>
                    <Button variant="outline" size="sm" onClick={() => addOption(question.id)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Opción
                    </Button>
                  </div>

                  {question.options.map((option, optionIndex) => (
                    <div key={option.id} className="flex gap-2">
                      <Input
                        placeholder={`Opción ${optionIndex + 1}`}
                        value={option.text}
                        onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                        className="flex-1"
                      />
                      {question.options.length > 2 && (
                        <Button variant="outline" size="sm" onClick={() => removeOption(question.id, option.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 pt-6">
          <Button onClick={saveSession} className="flex-1 sm:flex-none">
            <Save className="w-4 h-4 mr-2" />
            Guardar Sesión
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/dashboard")} className="flex-1 sm:flex-none">
            Cancelar
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
