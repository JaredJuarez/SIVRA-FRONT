'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit3, GripVertical, Save, X } from 'lucide-react';
import { AdminService, AdminQuestion, CreateQuestionRequest, UpdateQuestionRequest } from '@/lib/AdminService';

interface EditSessionDialogProps {
  sessionId: string;
  sessionTitle: string;
  sessionStatus: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'CLOSED';
  questions: AdminQuestion[];
  children: React.ReactNode;
  onSessionUpdated: () => void;
}

interface EditableQuestion extends AdminQuestion {
  isEditing?: boolean;
  isNew?: boolean;
}

export function EditSessionDialog({ 
  sessionId, 
  sessionTitle, 
  sessionStatus, 
  questions: initialQuestions, 
  children,
  onSessionUpdated 
}: EditSessionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState<EditableQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

  // Estados para nueva pregunta
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState<CreateQuestionRequest>({
    questionText: '',
    type: 'MULTIPLE_CHOICE',
    order: 1,
    options: ['', '']
  });

  const canEdit = sessionStatus === 'INACTIVE' || sessionStatus === 'DRAFT';

  useEffect(() => {
    if (isOpen) {
      setQuestions(initialQuestions.map(q => ({ ...q, isEditing: false, isNew: false })));
    }
  }, [isOpen, initialQuestions]);

  const handleAddOption = (questionIndex: number) => {
    setQuestions(prev => prev.map((q, index) => {
      if (index === questionIndex && q.options) {
        return {
          ...q,
          options: [...q.options, { id: Date.now(), optionText: '', order: q.options.length + 1, voteCount: 0, votePercentage: 0 }]
        };
      }
      return q;
    }));
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    setQuestions(prev => prev.map((q, index) => {
      if (index === questionIndex && q.options && q.options.length > 2) {
        const newOptions = q.options.filter((_, i) => i !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions(prev => prev.map((q, index) => {
      if (index === questionIndex && q.options) {
        const newOptions = q.options.map((opt, i) => 
          i === optionIndex ? { ...opt, optionText: value } : opt
        );
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === index) {
        const updatedQuestion = { ...q, [field]: value };
        // Si cambiamos a OPEN_TEXT, eliminamos las opciones
        if (field === 'type' && value === 'OPEN_TEXT') {
          updatedQuestion.options = undefined;
        }
        // Si cambiamos a MULTIPLE_CHOICE, agregamos opciones por defecto
        if (field === 'type' && value === 'MULTIPLE_CHOICE' && !updatedQuestion.options) {
          updatedQuestion.options = [
            { id: Date.now(), optionText: '', order: 1, voteCount: 0, votePercentage: 0 },
            { id: Date.now() + 1, optionText: '', order: 2, voteCount: 0, votePercentage: 0 }
          ];
        }
        return updatedQuestion;
      }
      return q;
    }));
  };

  const handleSaveQuestion = async (index: number) => {
    if (!canEdit) return;

    const question = questions[index];
    
    // Verificar si la pregunta tiene votos y no es nueva
    if (!question.isNew && question.totalVotes > 0) {
      alert('No se puede editar una pregunta que ya tiene votos');
      return;
    }

    setLoading(true);

    try {
      const questionData: UpdateQuestionRequest = {
        questionText: question.questionText,
        type: question.type || 'MULTIPLE_CHOICE',
        order: question.order,
        options: question.type === 'MULTIPLE_CHOICE' && question.options 
          ? question.options.map(opt => opt.optionText).filter(text => text.trim() !== '')
          : undefined
      };

      if (question.isNew) {
        const newQ = await AdminService.createQuestion(sessionId, questionData);
        setQuestions(prev => prev.map((q, i) => 
          i === index ? { ...newQ, isEditing: false, isNew: false } : q
        ));
      } else {
        const updatedQ = await AdminService.updateQuestion(sessionId, question.id.toString(), questionData);
        setQuestions(prev => prev.map((q, i) => 
          i === index ? { ...updatedQ, isEditing: false } : q
        ));
      }

      onSessionUpdated();
    } catch (error: any) {
      console.error('Error saving question:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al guardar la pregunta';
      
      if (error.message.includes('400')) {
        errorMessage = 'No se puede modificar una pregunta que ya tiene votos';
      } else if (error.message.includes('403')) {
        errorMessage = 'No tienes permisos para modificar esta pregunta';
      } else if (error.message.includes('404')) {
        errorMessage = 'La pregunta no fue encontrada';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!canEdit) return;

    // Verificar si la pregunta tiene votos
    const questionToDelete = questions.find(q => q.id === questionId);
    if (questionToDelete && questionToDelete.totalVotes > 0) {
      alert('No se puede eliminar una pregunta que ya tiene votos');
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
      return;
    }

    setLoading(true);
    try {
      await AdminService.deleteQuestion(sessionId, questionId.toString());
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      onSessionUpdated();
    } catch (error: any) {
      console.error('Error deleting question:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al eliminar la pregunta';
      
      if (error.message.includes('400')) {
        errorMessage = 'No se puede eliminar una pregunta que ya tiene votos';
      } else if (error.message.includes('403')) {
        errorMessage = 'No tienes permisos para eliminar esta pregunta';
      } else if (error.message.includes('404')) {
        errorMessage = 'La pregunta no fue encontrada';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
    }
  };

  const handleAddNewQuestion = () => {
    const newQ: EditableQuestion = {
      id: Date.now(), // ID temporal
      questionText: '',
      type: 'MULTIPLE_CHOICE',
      order: questions.length + 1,
      totalVotes: 0,
      options: [
        { id: Date.now(), optionText: '', order: 1, voteCount: 0, votePercentage: 0 },
        { id: Date.now() + 1, optionText: '', order: 2, voteCount: 0, votePercentage: 0 }
      ],
      isEditing: true,
      isNew: true
    };

    setQuestions(prev => [...prev, newQ]);
  };

  const handleCancelEdit = (index: number) => {
    const question = questions[index];
    if (question.isNew) {
      setQuestions(prev => prev.filter((_, i) => i !== index));
    } else {
      setQuestions(prev => prev.map((q, i) => 
        i === index ? { ...initialQuestions.find(iq => iq.id === q.id)!, isEditing: false } : q
      ));
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Sesión: {sessionTitle}</DialogTitle>
            <DialogDescription>
              {canEdit 
                ? 'Modifica las preguntas de tu sesión. Solo se pueden editar sesiones desactivadas.'
                : `No se puede editar una sesión ${sessionStatus === 'ACTIVE' ? 'activa' : 'cerrada'}.`
              }
            </DialogDescription>
          </DialogHeader>

          {!canEdit ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-gray-500">
                  <Edit3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Edición no disponible</h3>
                  <p>Las preguntas solo se pueden modificar cuando la sesión está desactivada.</p>
                  <Badge variant={sessionStatus === 'ACTIVE' ? 'default' : 'secondary'} className="mt-3">
                    Estado actual: {sessionStatus === 'ACTIVE' ? 'Activa' : sessionStatus === 'CLOSED' ? 'Cerrada' : 'Desactivada'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Lista de preguntas existentes */}
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id} className={`relative ${question.totalVotes > 0 && !question.isNew ? 'bg-gray-50 border-gray-300' : ''}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-base">
                        Pregunta {index + 1}
                        {question.isNew && <Badge variant="secondary" className="ml-2">Nueva</Badge>}
                        {question.totalVotes > 0 && (
                          <Badge variant="outline" className="ml-2">
                            {question.totalVotes} voto{question.totalVotes !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        {question.totalVotes > 0 && !question.isNew && (
                          <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                            🔒 Bloqueada
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {question.isEditing ? (
                          <>
                            <Button size="sm" onClick={() => handleSaveQuestion(index)} disabled={loading}>
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleCancelEdit(index)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setQuestions(prev => prev.map((q, i) => i === index ? { ...q, isEditing: true } : q))}
                              disabled={question.totalVotes > 0}
                              title={question.totalVotes > 0 ? "No se puede editar una pregunta que ya tiene votos" : "Editar pregunta"}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                if (question.totalVotes > 0) {
                                  alert('No se puede eliminar una pregunta que ya tiene votos');
                                  return;
                                }
                                setQuestionToDelete(question.id);
                                setDeleteDialogOpen(true);
                              }}
                              disabled={question.totalVotes > 0}
                              title={question.totalVotes > 0 ? "No se puede eliminar una pregunta que ya tiene votos" : "Eliminar pregunta"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Mensaje de advertencia si la pregunta tiene votos */}
                      {question.totalVotes > 0 && !question.isNew && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">
                              Esta pregunta no se puede modificar porque ya tiene {question.totalVotes} voto{question.totalVotes !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      )}

                      {question.isEditing ? (
                        <>
                          <div>
                            <Label htmlFor={`question-${index}`}>Texto de la pregunta</Label>
                            <Textarea
                              id={`question-${index}`}
                              value={question.questionText}
                              onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                              placeholder="Escribe tu pregunta aquí..."
                            />
                          </div>

                          <div>
                            <Label htmlFor={`type-${index}`}>Tipo de pregunta</Label>
                            <Select 
                              value={question.type || 'MULTIPLE_CHOICE'} 
                              onValueChange={(value) => handleQuestionChange(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MULTIPLE_CHOICE">Opción múltiple</SelectItem>
                                <SelectItem value="OPEN_TEXT">Texto libre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {question.type === 'MULTIPLE_CHOICE' && question.options && (
                            <div>
                              <Label>Opciones de respuesta</Label>
                              <div className="space-y-2 mt-2">
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                    <Input
                                      value={option.optionText}
                                      onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                                      placeholder={`Opción ${optionIndex + 1}`}
                                      className="flex-1"
                                    />
                                    {question.options && question.options.length > 2 && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRemoveOption(index, optionIndex)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddOption(index)}
                                  className="w-full"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Agregar opción
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div>
                            <strong>{question.questionText}</strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {question.type === 'MULTIPLE_CHOICE' ? 'Opción múltiple' : 'Texto libre'}
                            </Badge>
                            {question.options && question.options.length > 0 && (
                              <Badge variant="secondary">
                                {question.options.length} opciones
                              </Badge>
                            )}
                          </div>
                          {question.type === 'MULTIPLE_CHOICE' && question.options && (
                            <div className="ml-4 space-y-1">
                              {question.options.map((option, i) => (
                                <div key={i} className="text-sm text-gray-600">
                                  • {option.optionText}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Botón para agregar nueva pregunta */}
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <Button onClick={handleAddNewQuestion} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar nueva pregunta
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={() => setIsOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La pregunta será eliminada permanentemente.
              {questionToDelete && (() => {
                const questionData = questions.find(q => q.id === questionToDelete);
                return questionData && questionData.totalVotes > 0 && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800">
                    ⚠️ Esta pregunta tiene votos y no se puede eliminar.
                  </div>
                );
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => questionToDelete && handleDeleteQuestion(questionToDelete)}
              className="bg-red-600 hover:bg-red-700"
              disabled={questionToDelete ? (questions.find(q => q.id === questionToDelete)?.totalVotes ?? 0) > 0 : false}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
