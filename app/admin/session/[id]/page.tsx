"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter, useParams } from "next/navigation"
import { QrCode, ExternalLink, Users, BarChart3, Copy, Check } from "lucide-react"
import { AdminLayout } from "@/components/AdminLayout"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import QRCode from "qrcode"

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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function SessionResults() {
  const [session, setSession] = useState<VotingSession | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  useEffect(() => {
    if (!localStorage.getItem("isAdmin")) {
      router.push("/")
      return
    }

    const sessions = JSON.parse(localStorage.getItem("votingSessions") || "[]")
    const foundSession = sessions.find((s: VotingSession) => s.id === sessionId)

    if (!foundSession) {
      router.push("/admin/dashboard")
      return
    }

    setSession(foundSession)

    // Generar QR Code
    const voteUrl = `${window.location.origin}/vote/${sessionId}`
    QRCode.toDataURL(voteUrl, { width: 200 })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error(err))

    // Actualizar datos cada 3 segundos si la sesión está activa
    const interval = setInterval(() => {
      if (foundSession.status === "active") {
        const updatedSessions = JSON.parse(localStorage.getItem("votingSessions") || "[]")
        const updatedSession = updatedSessions.find((s: VotingSession) => s.id === sessionId)
        if (updatedSession) {
          setSession(updatedSession)
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [sessionId, router])

  const copyLink = () => {
    const voteUrl = `${window.location.origin}/vote/${sessionId}`
    navigator.clipboard.writeText(voteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  if (!session) {
    return (
      <AdminLayout>
        <div>Cargando...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{session.name}</h1>
              <Badge className={getStatusColor(session.status)}>{getStatusText(session.status)}</Badge>
            </div>
            <p className="text-gray-600">Resultados en tiempo real</p>
          </div>
          <Button onClick={() => router.push("/admin/dashboard")} variant="outline">
            Volver al Dashboard
          </Button>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Votos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session.totalVotes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preguntas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session.questions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <div
                className={`w-3 h-3 rounded-full ${
                  session.status === "active"
                    ? "bg-green-500"
                    : session.status === "closed"
                      ? "bg-red-500"
                      : "bg-gray-500"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getStatusText(session.status)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Compartir sesión */}
        {session.status === "active" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Compartir Sesión
              </CardTitle>
              <CardDescription>
                Comparte este enlace o código QR para que los participantes puedan votar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Enlace de votación:</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={`${window.location.origin}/vote/${sessionId}`}
                        readOnly
                        className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
                      />
                      <Button onClick={copyLink} variant="outline" size="sm">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.open(`/vote/${sessionId}`, "_blank")}
                    variant="outline"
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir Vista de Participante
                  </Button>
                </div>
                {qrCodeUrl && (
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-medium mb-2">Código QR:</p>
                    <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="border rounded-lg" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultados por pregunta */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Resultados por Pregunta</h2>
          {session.questions.map((question, index) => {
            const totalVotes = question.options.reduce((sum, option) => sum + option.votes, 0)
            const chartData = question.options.map((option) => ({
              name: option.text,
              value: option.votes,
              percentage: totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : "0",
            }))

            return (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle>Pregunta {index + 1}</CardTitle>
                  <CardDescription>{question.question}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-4">Distribución de votos:</h4>
                      {totalVotes > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percentage }) => `${name}: ${percentage}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-[300px] text-gray-500">Sin votos aún</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium mb-4">Detalles:</h4>
                      <div className="space-y-3">
                        {question.options.map((option, optionIndex) => (
                          <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: COLORS[optionIndex % COLORS.length] }}
                              />
                              <span className="font-medium">{option.text}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{option.votes} votos</div>
                              <div className="text-sm text-gray-600">
                                {totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : "0"}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-900">Total de votos: {totalVotes}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}
