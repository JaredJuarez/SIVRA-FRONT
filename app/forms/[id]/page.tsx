"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminLayout } from "@/components/AdminLayout"
import { QuestionEditor } from "@/components/forms/question-editor"
import { ArrowLeft, Edit, Trash2, Plus, Settings, FileText, Users, BarChart3 } from "lucide-react"
import { formService } from "@/lib/services/form.service"
import { Form } from "@/lib/types/form.types"
import { Question } from "@/lib/types/question.types"
import { useToast } from "@/hooks/use-toast"

export default function FormDetails() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const formId = params.id as string

  const [form, setForm] = useState<Form | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Función helper para formatear fechas
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Fecha no disponible"
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString)
        return "Fecha inválida"
      }
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', dateString, error)
      return "Error en fecha"
    }
  }

  useEffect(() => {
    loadForm()
  }, [formId])

  const loadForm = async () => {
    try {
      console.log('🔥 Loading form:', formId)
      const formData = await formService.getForm(formId)
      console.log('✅ Form loaded:', formData)
      setForm(formData)
    } catch (error) {
      console.error('❌ Error loading form:', error)
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

  const handleQuestionsUpdate = (updatedQuestions: Question[]) => {
    if (form) {
      setForm({
        ...form,
        questions: updatedQuestions
      })
    }
  }

  const getFormTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      'SURVEY': 'default',
      'POLL': 'secondary',
      'QUIZ': 'outline'
    }
    return variants[type] || 'default'
  }

  const getFormTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'SURVEY': 'Encuesta',
      'POLL': 'Votación',
      'QUIZ': 'Quiz'
    }
    return labels[type] || type
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="max-w-6xl mx-auto">
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
          <div className="max-w-6xl mx-auto text-center">
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
        <div className="max-w-6xl mx-auto">
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
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
                  <Badge variant={getFormTypeBadge(form.type)}>
                    {getFormTypeLabel(form.type)}
                  </Badge>
                </div>
                {form.description && (
                  <p className="text-gray-600">{form.description}</p>
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
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>

          {/* Form Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-500">Preguntas</p>
                    <p className="text-2xl font-bold">{form.questions?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-green-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-500">Respuestas</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-500">Tasa respuesta</p>
                    <p className="text-2xl font-bold">0%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Settings className="h-4 w-4 text-gray-600" />
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-500">Creado</p>
                    <p className="text-sm font-bold">{formatDate(form.created)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="questions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="questions">Preguntas</TabsTrigger>
              <TabsTrigger value="responses">Respuestas</TabsTrigger>
              <TabsTrigger value="analytics">Análisis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="questions" className="mt-6">
              <QuestionEditor
                formId={formId}
                questions={form.questions}
                onQuestionsUpdate={handleQuestionsUpdate}
              />
            </TabsContent>
            
            <TabsContent value="responses" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Respuestas del formulario</CardTitle>
                  <CardDescription>
                    Aquí aparecerán las respuestas cuando los usuarios completen el formulario
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Users className="mx-auto h-12 w-12 mb-4" />
                    <p>No hay respuestas aún</p>
                    <p className="text-sm">Las respuestas aparecerán aquí cuando se complete el formulario</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis y estadísticas</CardTitle>
                  <CardDescription>
                    Estadísticas detalladas sobre las respuestas del formulario
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="mx-auto h-12 w-12 mb-4" />
                    <p>No hay datos para analizar</p>
                    <p className="text-sm">Los análisis estarán disponibles cuando haya respuestas</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  )
}
