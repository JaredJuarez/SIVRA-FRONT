"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Plus, BarChart3, Users, ExternalLink, Play, Square, Trash2 } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"

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

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<VotingSession[]>([])
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación
    if (!localStorage.getItem("isAdmin")) {
      router.push("/")
      return
    }

    // Cargar sesiones del localStorage
    const savedSessions = localStorage.getItem("votingSessions")
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions))
    }
  }, [router])

  const toggleSessionStatus = (sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.map((session) => {
        if (session.id === sessionId) {
          const newStatus = session.status === "active" ? "closed" : "active"
          return { ...session, status: newStatus }
        }
        return session
      })
      localStorage.setItem("votingSessions", JSON.stringify(updated))
      return updated
    })
  }

  const deleteSession = (sessionId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta sesión?")) {
      setSessions((prev) => {
        const updated = prev.filter((session) => session.id !== sessionId)
        localStorage.setItem("votingSessions", JSON.stringify(updated))
        return updated
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activa"
      case "closed":
        return "Cerrada"
      default:
        return "Borrador"
    }
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
                {sessions.filter((s) => s.status === "active").length}
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
                {sessions.reduce((total, session) => total + session.totalVotes, 0)}
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
              {sessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{session.name}</CardTitle>
                          <Badge className={getStatusColor(session.status)}>{getStatusText(session.status)}</Badge>
                        </div>
                        <CardDescription>
                          {session.questions.length} pregunta{session.questions.length !== 1 ? "s" : ""} •{" "}
                          {session.totalVotes} voto{session.totalVotes !== 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/session/${session.id}`)}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Ver Resultados
                        </Button>
                        {session.status === "active" && (
                          <Button variant="outline" size="sm" onClick={() => router.push(`/vote/${session.id}`)}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Vista Participante
                          </Button>
                        )}
                        <Button
                          variant={session.status === "active" ? "destructive" : "default"}
                          size="sm"
                          onClick={() => toggleSessionStatus(session.id)}
                        >
                          {session.status === "active" ? (
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
