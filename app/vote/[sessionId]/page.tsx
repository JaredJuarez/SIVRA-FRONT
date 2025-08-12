"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, Users, Clock } from "lucide-react"
import { formService } from "@/lib/services/form.service"
import { Form } from "@/lib/types/form.types"
import { useToast } from "@/hooks/use-toast"

export default function VoteSession() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const sessionId = params.sessionId as string

  const [form, setForm] = useState<Form | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [responses, setResponses] = useState<Record<string, string | string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    loadForm()
  }, [sessionId])

  const loadForm = async () => {
    try {
      const formData = await formService.getForm(sessionId)
      setForm(formData)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el formulario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResponseChange = (questionId: string, value: string | string[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async () => {
    if (!form) return

    // Validar que todas las preguntas obligatorias estén respondidas
    const unansweredRequired = form.questions?.filter(question => 
      question.required && !responses[question.id]
    ) || []

    if (unansweredRequired.length > 0) {
      toast({
        title: "Respuestas incompletas",
        description: "Por favor responde todas las preguntas obligatorias",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Aquí enviarías las respuestas al backend
      // await responseService.submitResponses(sessionId, responses)
      
      toast({
        title: "¡Respuestas enviadas!",
        description: "Gracias por participar en esta votación",
      })
      setIsSubmitted(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron enviar las respuestas. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return ""
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return ""
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Formulario no encontrado</CardTitle>
            <CardDescription>
              El formulario que buscas no existe o no está disponible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/")} 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-600">¡Respuestas enviadas!</CardTitle>
            <CardDescription>
              Gracias por participar en "{form.title}". Tus respuestas han sido registradas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/")} 
              className="w-full"
            >
              Finalizar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  {form.type}
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <Users className="w-3 h-3 mr-1" />
                  Público
                </Badge>
              </div>
              <CardTitle className="text-2xl">{form.title}</CardTitle>
              <CardDescription className="text-base">
                {form.description}
              </CardDescription>
              
              {/* Dates info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-4">
                {form.open && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Abierto desde: {formatDate(form.open)}
                  </div>
                )}
                {form.closed && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Cierra: {formatDate(form.closed)}
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Questions */}
          <div className="space-y-6">
            {form.questions?.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {index + 1}
                    </span>
                    {question.text}
                    {question.required && (
                      <span className="text-red-500">*</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {question.type === 'SINGLE_CHOICE' ? (
                    <RadioGroup
                      value={responses[question.id] as string || ""}
                      onValueChange={(value) => handleResponseChange(question.id, value)}
                    >
                      {question.options?.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={`${question.id}_${option.id}`} />
                          <Label htmlFor={`${question.id}_${option.id}`} className="flex-1 cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : question.type === 'MULTIPLE_CHOICE' ? (
                    <div className="space-y-3">
                      {question.options?.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${question.id}_${option.id}`}
                            checked={(responses[question.id] as string[] || []).includes(option.id)}
                            onCheckedChange={(checked) => {
                              const currentResponses = responses[question.id] as string[] || []
                              if (checked) {
                                handleResponseChange(question.id, [...currentResponses, option.id])
                              } else {
                                handleResponseChange(question.id, currentResponses.filter(r => r !== option.id))
                              }
                            }}
                          />
                          <Label htmlFor={`${question.id}_${option.id}`} className="flex-1 cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : question.type === 'TEXT' ? (
                    <div className="space-y-3">
                      <p className="text-gray-600">Pregunta de texto libre</p>
                      <textarea 
                        className="w-full p-3 border border-gray-300 rounded-md resize-none"
                        rows={4}
                        placeholder="Escribe tu respuesta aquí..."
                        value={responses[question.id] as string || ""}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Tipo de pregunta no soportado</p>
                  )}
                </CardContent>
              </Card>
            )) || (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">
                    Este formulario aún no tiene preguntas configuradas.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Submit Button */}
          {form.questions && form.questions.length > 0 && (
            <Card className="mt-8">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {form.questions.filter(q => q.required).length} preguntas obligatorias
                  </p>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Respuestas"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}