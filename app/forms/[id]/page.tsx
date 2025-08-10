"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/AdminLayout"
import { ArrowLeft, Edit, Trash2, Plus, Settings } from "lucide-react"
import { formService } from "@/lib/services/form.service"
import { questionService } from "@/lib/services/question.service"
import { Form } from "@/lib/types/form.types"
import { useToast } from "@/hooks/use-toast"

export default function FormDetails() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const formId = params.id as string

  const [form, setForm] = useState<Form | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadForm()
  }, [formId])

  const loadForm = async () => {
    try {
      const formData = await formService.getFormById(formId)
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

  const handleDeleteForm = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este formulario?")) {
      return
    }

    try {
      await formService.deleteForm(formId)
      toast({
        title: "Formulario eliminado",
        description: "El formulario se ha eliminado correctamente",
      })
      router.push("/admin/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el formulario",
        variant: "destructive",
      })
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
      return
    }

    try {
      await questionService.deleteQuestion(questionId)
      toast({
        title: "Pregunta eliminada",
        description: "La pregunta se ha eliminado correctamente",
      })
      loadForm() // Recargar formulario
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la pregunta",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!form) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Formulario no encontrado
            </h1>
            <Button onClick={() => router.push("/admin/dashboard")}>
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
                {form.description && (
                  <p className="text-gray-600 mt-1">{form.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDeleteForm}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>

          {/* Form Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Información del Formulario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Total de preguntas:</span>
                  <span className="ml-2">{form.questions?.length || 0}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Fecha de creación:</span>
                  <span className="ml-2">
                    {new Date(form.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Preguntas</h2>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Pregunta
            </Button>
          </div>

          {form.questions && form.questions.length > 0 ? (
            <div className="space-y-4">
              {form.questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {index + 1}. {question.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {question.type}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {question.options && question.options.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">Opciones:</p>
                        <ul className="space-y-1">
                          {question.options.map((option) => (
                            <li key={option.id} className="text-sm text-gray-600 flex items-center">
                              <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                              {option.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {question.type === 'text' ? 'Respuesta de texto libre' : 'Sin opciones configuradas'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  Este formulario no tiene preguntas aún
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primera Pregunta
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
