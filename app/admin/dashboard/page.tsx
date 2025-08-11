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

  useEffect(() => {
    if (isAuthenticated) {
      loadForms()
    }
  }, [isAuthenticated])

  const loadForms = async () => {
    try {
      const formsData = await formService.getForms()
      console.log('📋 Dashboard: Forms data received:', formsData)
      // Asegurar que formsData sea un array
      const formsArray = Array.isArray(formsData) ? formsData : []
      setForms(formsArray)
    } catch (error) {
      // En caso de error, usar datos mock temporalmente
      console.log("Error loading forms, using mock data:", error)
      setForms([])
    } finally {
      setIsLoading(false)
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
                          Creado el {new Date(form.createdAt).toLocaleDateString()}
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
