"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Save } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { AdminService } from "@/lib/AdminService"
import { QuestionService, CreateQuestionRequest } from "@/lib/QuestionService"

interface Question {
  id: string
  question: string
  type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT'
  options: Array<{ id: string; text: string; votes: number }>
}

export default function CreateSession() {
  const [sessionTitle, setSessionTitle] = useState("")
  const [sessionDescription, setSessionDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "1",
      question: "",
      type: "MULTIPLE_CHOICE",
      options: [
        { id: "1", text: "", votes: 0 },
        { id: "2", text: "", votes: 0 },
      ],
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const questionsHeaderRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      if (questionsHeaderRef.current) {
        const rect = questionsHeaderRef.current.getBoundingClientRect()
        setIsSticky(rect.top <= 0)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: "",
      type: "MULTIPLE_CHOICE",
      options: [
        { id: Date.now().toString() + "1", text: "", votes: 0 },
        { id: Date.now().toString() + "2", text: "", votes: 0 },
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

  const updateQuestionType = (questionId: string, newType: 'MULTIPLE_CHOICE' | 'OPEN_TEXT') => {
    setQuestions(questions.map((q) => 
      q.id === questionId ? { 
        ...q, 
        type: newType,
        // Si cambia a OPEN_TEXT, limpiamos las opciones
        options: newType === 'OPEN_TEXT' ? [] : q.options.length === 0 ? [
          { id: Date.now().toString() + "1", text: "", votes: 0 },
          { id: Date.now().toString() + "2", text: "", votes: 0 },
        ] : q.options
      } : q
    ))
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

  const saveSession = async () => {
    if (!sessionTitle.trim()) {
      alert("Por favor ingresa un título para la sesión")
      return
    }

    const hasEmptyQuestions = questions.some((q) => !q.question.trim())
    if (hasEmptyQuestions) {
      alert("Por favor completa todas las preguntas")
      return
    }

    // Validar opciones solo para preguntas de opción múltiple
    const multipleChoiceQuestions = questions.filter(q => q.type === 'MULTIPLE_CHOICE')
    const hasEmptyOptions = multipleChoiceQuestions.some((q) => 
      q.options.length < 2 || q.options.some((o) => !o.text.trim())
    )
    if (hasEmptyOptions) {
      alert("Por favor completa al menos 2 opciones para las preguntas de opción múltiple")
      return
    }

    try {
      setIsLoading(true)
      
      // Paso 1: Crear la sesión
      console.log('🎯 [CREATE_SESSION] Creando sesión...')
      const sessionData = {
        title: sessionTitle,
        description: sessionDescription || "Sesión de votación"
      }

      const createdSession = await AdminService.createSession(sessionData)
      console.log('✅ [CREATE_SESSION] Sesión creada:', createdSession)

      // Paso 2: Crear todas las preguntas
      console.log('📝 [CREATE_SESSION] Creando preguntas...')
      const questionPromises = questions.map(async (question, index) => {
        const questionRequest: CreateQuestionRequest = {
          questionText: question.question,
          type: question.type,
          order: index + 1,
          // Solo incluir opciones si es de opción múltiple
          options: question.type === 'MULTIPLE_CHOICE' 
            ? question.options.map(o => o.text).filter(text => text.trim()) 
            : undefined
        }

        console.log(`🔍 [CREATE_SESSION] Pregunta ${index + 1}:`, {
          text: questionRequest.questionText,
          type: questionRequest.type,
          hasOptions: questionRequest.options?.length || 0,
          options: questionRequest.options
        })

        return QuestionService.createQuestion(createdSession.id, questionRequest)
      })

      await Promise.all(questionPromises)
      console.log('✅ [CREATE_SESSION] Todas las preguntas creadas exitosamente')
      
      alert("Sesión y preguntas creadas exitosamente")
      router.push("/admin/dashboard")
      
    } catch (error) {
      console.error("❌ [CREATE_SESSION] Error creating session with questions:", error)
      alert("Error al crear la sesión y preguntas. Por favor intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
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
                <Label htmlFor="sessionTitle">Título de la Sesión</Label>
                <Input
                  id="sessionTitle"
                  placeholder="Ej: Votación Conferencia Tech 2024"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sessionDescription">Descripción (opcional)</Label>
                <Textarea
                  id="sessionDescription"
                  placeholder="Describe el propósito de esta sesión de votación..."
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div ref={questionsHeaderRef} className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Preguntas</h2>
            <Button className="bg-indigo-600 text-white font-bold" onClick={addQuestion} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Pregunta
            </Button>
          </div>

          {/* Botón sticky que aparece cuando se hace scroll */}
          {isSticky && (
            <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b shadow-sm z-50 py-3">
              <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">
                  Preguntas ({questions.length})
                </span>
                <Button 
                  className="bg-indigo-600 text-white font-bold shadow-lg" 
                  onClick={addQuestion} 
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Pregunta
                </Button>
              </div>
            </div>
          )}

          {questions.map((question, questionIndex) => (
            <Card key={question.id} className={isSticky && questionIndex === 0 ? "mt-16" : ""}>
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

                <div>
                  <Label>Tipo de Pregunta</Label>
                  <Select 
                    value={question.type} 
                    onValueChange={(value: 'MULTIPLE_CHOICE' | 'OPEN_TEXT') => updateQuestionType(question.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de pregunta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MULTIPLE_CHOICE">Opción Múltiple</SelectItem>
                      <SelectItem value="OPEN_TEXT">Respuesta Libre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {question.type === 'MULTIPLE_CHOICE' && (
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
                )}

                {question.type === 'OPEN_TEXT' && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800 text-sm">
                      <span>💭</span>
                      <span>Esta pregunta permitirá respuestas de texto libre</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 pt-6">
          <Button 
            onClick={saveSession} 
            className="flex-1 sm:flex-none"
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar Sesión'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push("/admin/dashboard")} 
            className="flex-1 sm:flex-none"
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
