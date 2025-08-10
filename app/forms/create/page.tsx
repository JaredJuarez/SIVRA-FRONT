"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminLayout } from "@/components/AdminLayout"
import { ArrowLeft, Plus } from "lucide-react"
import { formService } from "@/lib/services/form.service"
import { useToast } from "@/hooks/use-toast"

export default function CreateForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "El título del formulario es requerido",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      const newForm = await formService.createForm({
        title: formData.title,
        description: formData.description || undefined
      })
      
      toast({
        title: "¡Formulario creado!",
        description: "El formulario se ha creado correctamente",
      })
      
      // Redirigir al dashboard o a la página de edición del formulario
      router.push("/admin/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el formulario. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Formulario</h1>
              <p className="text-gray-600 mt-1">
                Configura un nuevo formulario de votación
              </p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Información del Formulario
              </CardTitle>
              <CardDescription>
                Completa los datos básicos para crear tu formulario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Título del Formulario *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Ej: Encuesta de satisfacción 2024"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descripción (Opcional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe el propósito y contexto de este formulario..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creando..." : "Crear Formulario"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Próximos Pasos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Una vez creado el formulario, podrás agregar preguntas</p>
                <p>• Cada pregunta puede tener múltiples opciones de respuesta</p>
                <p>• Podrás activar el formulario para recibir respuestas</p>
                <p>• Los resultados se mostrarán en tiempo real</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
