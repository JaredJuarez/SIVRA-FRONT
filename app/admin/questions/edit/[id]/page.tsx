"use client"

export const dynamic = 'force-dynamic'

/*
 * Página para editar una pregunta existente
 * 
 * Endpoints utilizados:
 * - GET /api/question/{id} - para obtener la pregunta
 * - PUT /api/question/{id} - para actualizar la pregunta
 * - GET /api/option/question/{questionId} - para obtener las opciones
 * - POST /api/option/question/{questionId} - para crear nuevas opciones
 * - PUT /api/option/{id} - para actualizar opciones
 * - DELETE /api/option/{id} - para eliminar opciones
 */

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AdminLayout } from "@/components/AdminLayout"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import { questionService } from "@/lib/services/question.service"
import { optionService } from "@/lib/services/option.service"
import { Question, UpdateQuestionRequest } from "@/lib/types/question.types"
import { Option, CreateOptionRequest, UpdateOptionRequest } from "@/lib/types/option.types"
import { useToast } from "@/hooks/use-toast"

interface OptionForm extends Option {
    isNew?: boolean
    isDeleted?: boolean
}

export default function EditQuestion() {
    const router = useRouter()
    const params = useParams()
    const { toast } = useToast()
    const questionId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [question, setQuestion] = useState<Question | null>(null)

    // Question form data
    const [title, setTitle] = useState("")
    const [type, setType] = useState<'single' | 'multiple' | 'text'>('single')
    const [required, setRequired] = useState(false)
    const [options, setOptions] = useState<OptionForm[]>([])

    useEffect(() => {
        if (!questionId) {
            toast({
                title: "Error",
                description: "ID de pregunta no proporcionado",
                variant: "destructive",
            })
            router.push("/admin/dashboard")
            return
        }

        loadQuestion()
    }, [questionId])

    const loadQuestion = async () => {
        if (!questionId) return

        try {
            const questionData = await questionService.getQuestionById(questionId)
            setQuestion(questionData)
            setTitle(questionData.title)
            setType(questionData.type)
            setRequired(questionData.required)
            setOptions(questionData.options || [])
        } catch (error) {
            console.error('Error loading question:', error)
            toast({
                title: "Error",
                description: "No se pudo cargar la pregunta",
                variant: "destructive",
            })
            router.push("/admin/dashboard")
        } finally {
            setIsLoading(false)
        }
    }

    const addOption = () => {
        const newOption: OptionForm = {
            id: Date.now().toString(),
            questionId: questionId,
            text: '',
            isNew: true
        }
        setOptions([...options, newOption])
    }

    const removeOption = (optionId: string) => {
        const option = options.find(opt => opt.id === optionId)
        if (option && !option.isNew) {
            // Marcar para eliminar
            setOptions(options.map(opt =>
                opt.id === optionId ? { ...opt, isDeleted: true } : opt
            ))
        } else {
            // Eliminar completamente si es nueva
            setOptions(options.filter(opt => opt.id !== optionId))
        }
    }

    const updateOption = (optionId: string, text: string) => {
        setOptions(options.map(option =>
            option.id === optionId ? { ...option, text } : option
        ))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!questionId || !question) {
            toast({
                title: "Error",
                description: "Pregunta no válida",
                variant: "destructive",
            })
            return
        }

        if (!title.trim()) {
            toast({
                title: "Error",
                description: "El título de la pregunta es obligatorio",
                variant: "destructive",
            })
            return
        }

        if (type !== 'text') {
            const validOptions = options.filter(option => !option.isDeleted && option.text.trim())
            if (validOptions.length < 2) {
                toast({
                    title: "Error",
                    description: "Se requieren al menos 2 opciones válidas",
                    variant: "destructive",
                })
                return
            }
        }

        setIsSaving(true)
        try {
            // Actualizar la pregunta
            const questionData: UpdateQuestionRequest = {
                title: title.trim(),
                type,
                required
            }

            await questionService.updateQuestion(questionId, questionData)

            // Gestionar opciones si no es de tipo texto
            if (type !== 'text') {
                // Eliminar opciones marcadas para eliminar
                for (const option of options.filter(opt => opt.isDeleted && !opt.isNew)) {
                    try {
                        await optionService.deleteOption(option.id)
                    } catch (error) {
                        console.error('Error deleting option:', error)
                    }
                }

                // Actualizar opciones existentes
                for (const option of options.filter(opt => !opt.isNew && !opt.isDeleted)) {
                    try {
                        const optionData: UpdateOptionRequest = {
                            text: option.text.trim()
                        }
                        await optionService.updateOption(option.id, optionData)
                    } catch (error) {
                        console.error('Error updating option:', error)
                    }
                }

                // Crear nuevas opciones
                for (const option of options.filter(opt => opt.isNew && !opt.isDeleted && opt.text.trim())) {
                    try {
                        const optionData: CreateOptionRequest = {
                            text: option.text.trim()
                        }
                        await optionService.createOption(questionId, optionData)
                    } catch (error) {
                        console.error('Error creating option:', error)
                    }
                }
            }

            toast({
                title: "Pregunta actualizada",
                description: "La pregunta se ha actualizado correctamente",
            })

            router.push(`/forms/${question.formId}`)
        } catch (error) {
            console.error('Error updating question:', error)
            toast({
                title: "Error",
                description: "No se pudo actualizar la pregunta",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="container mx-auto p-6">
                    <div className="max-w-2xl mx-auto">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
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

    if (!question) {
        return (
            <AdminLayout>
                <div className="container mx-auto p-6">
                    <div className="max-w-2xl mx-auto text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Pregunta no encontrada
                        </h1>
                        <Button onClick={() => router.push("/admin/dashboard")}>
                            Volver al Dashboard
                        </Button>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    const visibleOptions = options.filter(opt => !opt.isDeleted)

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
                            <h1 className="text-3xl font-bold text-gray-900">Editar Pregunta</h1>
                            <p className="text-gray-600 mt-1">ID: {questionId}</p>
                        </div>
                    </div>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Editar Pregunta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Question Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Título de la pregunta *</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        placeholder="Escribe tu pregunta aquí..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Question Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="type">Tipo de pregunta *</Label>
                                    <Select value={type} onValueChange={(value: 'single' | 'multiple' | 'text') => setType(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona el tipo de pregunta" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">Selección única</SelectItem>
                                            <SelectItem value="multiple">Selección múltiple</SelectItem>
                                            <SelectItem value="text">Texto libre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Required Toggle */}
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="required"
                                        checked={required}
                                        onCheckedChange={setRequired}
                                    />
                                    <Label htmlFor="required">Pregunta obligatoria</Label>
                                </div>

                                {/* Options (only for single/multiple choice) */}
                                {type !== 'text' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Opciones de respuesta *</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addOption}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Agregar Opción
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {visibleOptions.map((option, index) => (
                                                <div key={option.id} className="flex gap-3 items-center">
                                                    <Input
                                                        placeholder={`Opción ${index + 1}`}
                                                        value={option.text}
                                                        onChange={(e) => updateOption(option.id, e.target.value)}
                                                        className="flex-1"
                                                    />
                                                    {visibleOptions.length > 2 && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeOption(option.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-4 pt-6">
                                    <Button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 sm:flex-none"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        disabled={isSaving}
                                        className="flex-1 sm:flex-none"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}
