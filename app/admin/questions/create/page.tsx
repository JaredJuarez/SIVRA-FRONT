"use client"

export const dynamic = 'force-dynamic'

/*
 * Página para crear una nueva pregunta para un formulario específico
 * 
 * Endpoints utilizados:
 * - POST /api/question/form/{formId} - para crear la pregunta
 * - POST /api/option/question/{questionId} - para crear las opciones
 */

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { formService } from "@/lib/services/form.service"
import { CreateQuestionRequest } from "@/lib/types/question.types"
import { CreateOptionRequest } from "@/lib/types/option.types"
import { useToast } from "@/hooks/use-toast"

interface OptionForm {
    id: string
    text: string
}

export default function CreateQuestion() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const formId = searchParams.get('formId')

    const [isLoading, setIsLoading] = useState(false)
    const [formTitle, setFormTitle] = useState("")

    // Question form data
    const [title, setTitle] = useState("")
    const [type, setType] = useState<'single' | 'multiple' | 'text'>('single')
    const [required, setRequired] = useState(false)
    const [options, setOptions] = useState<OptionForm[]>([
        { id: '1', text: '' },
        { id: '2', text: '' }
    ])

    useEffect(() => {
        if (!formId) {
            toast({
                title: "Error",
                description: "ID de formulario no proporcionado",
                variant: "destructive",
            })
            router.push("/admin/dashboard")
            return
        }

        loadFormInfo()
    }, [formId])

    const loadFormInfo = async () => {
        if (!formId) return

        try {
            const form = await formService.getForm(formId)
            setFormTitle(form.title)
        } catch (error) {
            console.error('Error loading form:', error)
            toast({
                title: "Error",
                description: "No se pudo cargar la información del formulario",
                variant: "destructive",
            })
        }
    }

    const addOption = () => {
        const newOption: OptionForm = {
            id: Date.now().toString(),
            text: ''
        }
        setOptions([...options, newOption])
    }

    const removeOption = (optionId: string) => {
        if (options.length > 2) {
            setOptions(options.filter(option => option.id !== optionId))
        }
    }

    const updateOption = (optionId: string, text: string) => {
        setOptions(options.map(option =>
            option.id === optionId ? { ...option, text } : option
        ))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formId) {
            toast({
                title: "Error",
                description: "ID de formulario no válido",
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
            const emptyOptions = options.filter(option => !option.text.trim())
            if (emptyOptions.length > 0) {
                toast({
                    title: "Error",
                    description: "Todas las opciones deben tener texto",
                    variant: "destructive",
                })
                return
            }

            if (options.length < 2) {
                toast({
                    title: "Error",
                    description: "Se requieren al menos 2 opciones",
                    variant: "destructive",
                })
                return
            }
        }

        setIsLoading(true)
        try {
            // Primero crear la pregunta
            const questionData: CreateQuestionRequest = {
                title: title.trim(),
                type,
                required,
                order: 0 // Se podría calcular dinámicamente
            }

            const createdQuestion = await questionService.createQuestion(formId, questionData)
            console.log('Question created:', createdQuestion)

            // Si es una pregunta con opciones, crear las opciones
            if (type !== 'text' && options.length > 0) {
                for (const option of options) {
                    if (option.text.trim()) {
                        const optionData: CreateOptionRequest = {
                            text: option.text.trim()
                        }
                        await optionService.createOption(createdQuestion.id, optionData)
                    }
                }
            }

            toast({
                title: "Pregunta creada",
                description: "La pregunta se ha creado correctamente",
            })

            router.push(`/forms/${formId}`)
        } catch (error) {
            console.error('Error creating question:', error)
            toast({
                title: "Error",
                description: "No se pudo crear la pregunta",
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
                            <h1 className="text-3xl font-bold text-gray-900">Crear Pregunta</h1>
                            {formTitle && (
                                <p className="text-gray-600 mt-1">Para el formulario: {formTitle}</p>
                            )}
                        </div>
                    </div>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Nueva Pregunta</CardTitle>
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
                                            {options.map((option, index) => (
                                                <div key={option.id} className="flex gap-3 items-center">
                                                    <Input
                                                        placeholder={`Opción ${index + 1}`}
                                                        value={option.text}
                                                        onChange={(e) => updateOption(option.id, e.target.value)}
                                                        className="flex-1"
                                                    />
                                                    {options.length > 2 && (
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
                                        disabled={isLoading}
                                        className="flex-1 sm:flex-none"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isLoading ? "Creando..." : "Crear Pregunta"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        disabled={isLoading}
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
