'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { Question, QuestionType, CreateQuestionRequest } from '@/lib/types/question.types';
import { Option, CreateOptionRequest } from '@/lib/types/option.types';
import { questionService } from '@/lib/services/question.service';
import { optionService } from '@/lib/services/option.service';
import { OptionEditor } from './option-editor';

const questionSchema = z.object({
  text: z.string().min(1, 'El texto de la pregunta es requerido'),
  type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT']),
  order: z.number().min(0),
  required: z.boolean().default(true)
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionEditorProps {
  formId: string;
  questions?: Question[];
  onQuestionsUpdate?: (questions: Question[]) => void;
}

export function QuestionEditor({ formId, questions = [], onQuestionsUpdate }: QuestionEditorProps) {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);
  const [loading, setLoading] = useState(false);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: '',
      type: 'SINGLE_CHOICE',
      order: 0,
      required: true
    }
  });

  useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);

  const handleCreateQuestion = async (data: QuestionFormData) => {
    setLoading(true);
    try {
      console.log('🔥 Creating question with data:', data);
      
      const createData: CreateQuestionRequest = {
        text: data.text,
        type: data.type,
        order: localQuestions.length,
        required: data.required
      };

      const newQuestion = await questionService.createQuestion(formId, createData);
      console.log('✅ Question created:', newQuestion);
      
      const updatedQuestions = [...localQuestions, newQuestion];
      setLocalQuestions(updatedQuestions);
      onQuestionsUpdate?.(updatedQuestions);
      
      form.reset();
      setIsCreating(false);
    } catch (error) {
      console.error('❌ Error creating question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async (questionId: string, data: QuestionFormData) => {
    setLoading(true);
    try {
      console.log('🔥 Updating question:', questionId, data);
      
      const updatedQuestion = await questionService.updateQuestion(questionId, data);
      console.log('✅ Question updated:', updatedQuestion);
      
      const updatedQuestions = localQuestions.map(q => 
        q.id === questionId ? updatedQuestion : q
      );
      setLocalQuestions(updatedQuestions);
      onQuestionsUpdate?.(updatedQuestions);
      
      setEditingQuestion(null);
    } catch (error) {
      console.error('❌ Error updating question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setLoading(true);
    try {
      console.log('🔥 Deleting question:', questionId);
      
      await questionService.deleteQuestion(questionId);
      console.log('✅ Question deleted');
      
      const updatedQuestions = localQuestions.filter(q => q.id !== questionId);
      setLocalQuestions(updatedQuestions);
      onQuestionsUpdate?.(updatedQuestions);
    } catch (error) {
      console.error('❌ Error deleting question:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (question: Question) => {
    setEditingQuestion(question);
    form.reset({
      text: question.text,
      type: question.type,
      order: question.order,
      required: question.required
    });
  };

  const cancelEditing = () => {
    setEditingQuestion(null);
    form.reset();
  };

  const getTypeLabel = (type: QuestionType): string => {
    switch (type) {
      case 'SINGLE_CHOICE': return 'Selección única';
      case 'MULTIPLE_CHOICE': return 'Selección múltiple';
      case 'TEXT': return 'Texto libre';
      default: return type;
    }
  };

  const getTypeBadgeVariant = (type: QuestionType) => {
    switch (type) {
      case 'SINGLE_CHOICE': return 'default';
      case 'MULTIPLE_CHOICE': return 'secondary';
      case 'TEXT': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Preguntas del formulario</h3>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
          Agregar pregunta
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingQuestion) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? 'Nueva pregunta' : 'Editar pregunta'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(
                  editingQuestion
                    ? (data) => handleUpdateQuestion(editingQuestion.id, data)
                    : handleCreateQuestion
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto de la pregunta</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Escribe tu pregunta aquí..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de pregunta</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo de pregunta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SINGLE_CHOICE">Selección única</SelectItem>
                          <SelectItem value="MULTIPLE_CHOICE">Selección múltiple</SelectItem>
                          <SelectItem value="TEXT">Texto libre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={isCreating ? () => setIsCreating(false) : cancelEditing}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : isCreating ? 'Crear pregunta' : 'Actualizar pregunta'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {localQuestions.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <p>No hay preguntas en este formulario</p>
                <p className="text-sm">Agrega la primera pregunta para comenzar</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          localQuestions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Pregunta {index + 1}</span>
                      <Badge variant={getTypeBadgeVariant(question.type)}>
                        {getTypeLabel(question.type)}
                      </Badge>
                      {question.required && (
                        <Badge variant="destructive">Requerida</Badge>
                      )}
                    </div>
                    <p className="text-base font-medium">{question.text}</p>
                    
                    {/* Options for choice questions */}
                    {(question.type === 'SINGLE_CHOICE' || question.type === 'MULTIPLE_CHOICE') && (
                      <div className="mt-4">
                        <OptionEditor
                          questionId={question.id}
                          options={question.options || []}
                          onOptionsUpdate={(options) => {
                            const updatedQuestions = localQuestions.map(q =>
                              q.id === question.id ? { ...q, options } : q
                            );
                            setLocalQuestions(updatedQuestions);
                            onQuestionsUpdate?.(updatedQuestions);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(question)}
                      disabled={loading}
                    >
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará la pregunta
                            y todas sus opciones de respuesta.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
