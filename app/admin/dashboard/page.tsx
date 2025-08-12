"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Plus, BarChart3, Users, ExternalLink, FileText, Trash2, Edit } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { useAuth } from "@/components/auth-provider"
import { formService } from "@/lib/services/form.service"
import { Form } from "@/lib/types/form.types"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Función helper para formatear fechas
  const formatDate = (dateString: string | undefined): string => {
    console.log('🗓️ Dashboard formatDate input:', dateString, 'Type:', typeof dateString);
    
    if (!dateString) {
      console.log('🗓️ No date string provided - showing fallback');
      return "Fecha no disponible"
    }
    
    try {
      // Intentar diferentes formatos de fecha que puede enviar Java
      let date: Date;
      
      // Si es un timestamp numérico
      if (!isNaN(Number(dateString))) {
        date = new Date(Number(dateString));
      } 
      // Si es una cadena de fecha
      else if (typeof dateString === 'string') {
        // Manejar formatos comunes de Java: "yyyy-MM-dd HH:mm:ss.SSSSSS" o ISO
        date = new Date(dateString);
      } else {
        console.warn('🗓️ Unknown date format:', dateString);
        return "Formato inválido"
      }
      
      console.log('🗓️ Parsed date object:', date, 'Valid:', !isNaN(date.getTime()));
      
      if (isNaN(date.getTime())) {
        console.warn('🗓️ Invalid date result:', dateString);
        return "Fecha inválida"
      }
      
      const formatted = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      console.log('🗓️ Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('🗓️ Error formatting date:', dateString, error);
      return "Error en fecha"
    }
  }

  // Función para mostrar información de fecha más útil
  const getFormDateInfo = (form: Form): string => {
    // Si no hay fecha de creación, mostrar el ID como referencia temporal
    if (!form.created) {
      return `ID: ${form.id}`
    }
    return `Creado el ${formatDate(form.created)}`
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadForms()
    }
  }, [isAuthenticated])

  const loadForms = async () => {
    console.log('🔄 Dashboard: Starting to load forms...');
    try {
      const formsData = await formService.getForms()
      console.log('📋 Dashboard: Forms data received:', formsData)
      console.log('📋 Dashboard: Forms data type:', typeof formsData, 'Is array:', Array.isArray(formsData))
      
      // Debug: verificar las fechas de cada formulario
      if (Array.isArray(formsData)) {
        formsData.forEach((form, index) => {
          console.log(`📋 Form ${index}:`, {
            id: form.id,
            title: form.title,
            created: form.created,
            createdType: typeof form.created,
            createdValue: JSON.stringify(form.created),
            parsedDate: form.created ? new Date(form.created) : null,
            fullForm: form
          })
        })
      }
      
      // Asegurar que formsData sea un array
      const formsArray = Array.isArray(formsData) ? formsData : []
      console.log('📋 Dashboard: Setting forms array with length:', formsArray.length);
      setForms(formsArray)
    } catch (error) {
      // En caso de error, usar datos mock temporalmente
      console.log("❌ Dashboard: Error loading forms:", error)
      setForms([])
    } finally {
      setIsLoading(false)
      console.log('✅ Dashboard: Load forms completed');
    }
  }

  const handleDeleteForm = async (formId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este formulario?")) {
      return
    }

    try {
      await formService.deleteForm(formId)
      setForms(prev => prev.filter(form => form.id !== formId))
      toast({
        title: "Formulario eliminado",
        description: "El formulario se ha eliminado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el formulario",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Bienvenido, {user?.name || "Administrador"}
            </p>
          </div>
          <Button onClick={() => router.push("/forms/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Formulario
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Formularios</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Array.isArray(forms) ? forms.length : 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Preguntas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Array.isArray(forms) ? forms.reduce((sum, form) => sum + (form.questions?.length || 0), 0) : 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Formularios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Array.isArray(forms) ? forms.length : 0} {/* Por ahora todos son activos */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forms List */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Mis Formularios</h2>
          
          {!Array.isArray(forms) || forms.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay formularios aún
                </h3>
                <p className="text-gray-600 mb-4">
                  Crea tu primer formulario para empezar a recibir respuestas
                </p>
                <Button onClick={() => router.push("/forms/create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Formulario
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {Array.isArray(forms) && forms.map((form) => (
                <Card key={form.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{form.title}</CardTitle>
                          <Badge className="bg-green-100 text-green-800">Activo</Badge>
                        </div>
                        <CardDescription>
                          {form.description}
                        </CardDescription>
                        <div className="text-sm text-gray-500 mt-2">
                          {form.questions?.length || 0} pregunta{(form.questions?.length || 0) !== 1 ? "s" : ""} • 
                          {getFormDateInfo(form)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => router.push(`/forms/${form.id}`)}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Ver Detalles
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/vote/${form.id}`)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Vista Participante
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteForm(form.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
