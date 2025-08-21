"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Plus, BarChart3, Users, ExternalLink, Play, Square, Trash2, Share2 } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { AuthService } from "@/lib/auth-service"
import { AdminService, AdminSession } from "@/lib/AdminService"
import { ShareDialog } from "@/components/ShareDialog"

// Actualizar la interfaz para coincidir con la respuesta del backend
interface VotingSession extends AdminSession {}

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<AdminSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await AdminService.getAllSessions()
      setSessions(data)
    } catch (err) {
      console.error('Error loading sessions:', err)
      setError('Error al cargar las sesiones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const toggleSessionStatus = async (sessionId: number) => {
    try {
      const session = sessions.find(s => s.id === sessionId)
      if (!session) return

      // Prevenir modificación si la sesión está cerrada
      if (session.status === 'CLOSED') {
        console.log(`🚫 [ADMIN_DASHBOARD] Cannot modify closed session ${sessionId}`)
        return
      }

      if (session.status === 'ACTIVE') {
        await AdminService.activateSession(sessionId)
      } else {
        await AdminService.activateSession(sessionId)
      }
      
      // Recargar las sesiones después de la actualización
      await loadSessions()
    } catch (err) {
      console.error('Error updating session status:', err)
      alert('Error al actualizar el estado de la sesión')
    }
  }

  const deleteSession = async (sessionId: number) => {
    try {
      const session = sessions.find(s => s.id === sessionId)
      if (!session) return

      // Prevenir eliminación si la sesión está cerrada
      if (session.status === 'CLOSED') {
        console.log(`🚫 [ADMIN_DASHBOARD] Cannot delete closed session ${sessionId}`)
        return
      }

      if (confirm('¿Estás seguro de que deseas eliminar esta sesión?')) {
        await AdminService.closeSession(sessionId)
        await loadSessions()
      }
    } catch (err) {
      console.error('Error deleting session:', err)
      alert('Error al eliminar la sesión')
    }
  }

  const getStatusColor = (status: AdminSession['status']) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "CLOSED":
        return "bg-red-100 text-red-800"
      case "INACTIVE":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: AdminSession['status']) => {
    switch (status) {
      case "ACTIVE":
        return "Activa"
      case "CLOSED":
        return "Cerrada"
      case "INACTIVE":
        return "Inactiva"
      default:
        return "Borrador"
    }
  }

  const getTotalVotes = (session: AdminSession) => {
    return session.questions.reduce((total, question) => total + question.totalVotes, 0)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
            <p className="text-gray-600">Gestiona tus sesiones de votación</p>
          </div>
          <Button onClick={() => router.push("/admin/create")} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Sesión
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg">Cargando sesiones...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sessions.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
                  <Play className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {sessions.filter((s) => s.status === "ACTIVE").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Votos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sessions.reduce((total, session) => total + getTotalVotes(session), 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de sesiones */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Mis Sesiones</h2>
              {sessions.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sesiones</h3>
                    <p className="text-gray-600 text-center mb-4">Crea tu primera sesión de votación para comenzar</p>
                    <Button onClick={() => router.push("/admin/create")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primera Sesión
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {sessions.map((session) => {
                    const totalVotes = getTotalVotes(session)
                    return (
                      <Card key={session.id}>
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">{session.title}</CardTitle>
                                <Badge className={getStatusColor(session.status)}>{getStatusText(session.status)}</Badge>
                              </div>
                              <CardDescription>
                                {session.questions.length} pregunta{session.questions.length !== 1 ? "s" : ""} •{" "}
                                {totalVotes} voto{totalVotes !== 1 ? "s" : ""}
                              </CardDescription>
                              <div className="text-xs text-gray-500 mt-1">
                                Código: {session.sessionCode}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" onClick={() => router.push(`/admin/session/${session.id}`)}>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Ver Resultados
                              </Button>
                              
                              {/* Solo mostrar estos botones si la sesión NO está cerrada */}
                              {session.status !== "CLOSED" && (
                                <>
                                  {session.status === "ACTIVE" && (
                                    <Button variant="outline" size="sm" onClick={() => router.push(`/vote/${session.sessionCode}`)}>
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Vista Participante
                                    </Button>
                                  )}
                                  <ShareDialog 
                                    sessionCode={session.sessionCode}
                                    sessionTitle={session.title}
                                    sessionLink={session.sessionLink}
                                  >
                                    <Button variant="outline" size="sm">
                                      <Share2 className="w-4 h-4 mr-2" />
                                      Compartir
                                    </Button>
                                  </ShareDialog>
                                  <Button
                                    variant={session.status === "ACTIVE" ? "destructive" : "default"}
                                    size="sm"
                                    onClick={() => toggleSessionStatus(session.id)}
                                  >
                                    {session.status === "ACTIVE" ? (
                                      <>
                                        <Square className="w-4 h-4 mr-2" />
                                        Cerrar
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Activar
                                      </>
                                    )}
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => deleteSession(session.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
