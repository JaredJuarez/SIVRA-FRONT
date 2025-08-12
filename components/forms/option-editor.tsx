'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Plus, GripVertical, Edit } from 'lucide-react';
import { Option, CreateOptionRequest } from '@/lib/types/option.types';
import { optionService } from '@/lib/services/option.service';

const optionSchema = z.object({
  text: z.string().min(1, 'El texto de la opción es requerido')
});

type OptionFormData = z.infer<typeof optionSchema>;

interface OptionEditorProps {
  questionId: string;
  options?: Option[];
  onOptionsUpdate?: (options: Option[]) => void;
}

export function OptionEditor({ questionId, options = [], onOptionsUpdate }: OptionEditorProps) {
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [localOptions, setLocalOptions] = useState<Option[]>(options);
  const [loading, setLoading] = useState(false);

  const form = useForm<OptionFormData>({
    resolver: zodResolver(optionSchema),
    defaultValues: {
      text: ''
    }
  });

  const handleCreateOption = async (data: OptionFormData) => {
    setLoading(true);
    try {
      console.log('🔥 Creating option with data:', data);
      
      const createData: CreateOptionRequest = {
        text: data.text,
        order: localOptions.length
      };

      const newOption = await optionService.createOption(questionId, createData);
      console.log('✅ Option created:', newOption);
      
      const updatedOptions = [...localOptions, newOption];
      setLocalOptions(updatedOptions);
      onOptionsUpdate?.(updatedOptions);
      
      form.reset();
      setIsCreating(false);
    } catch (error) {
      console.error('❌ Error creating option:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOption = async (optionId: string, data: OptionFormData) => {
    setLoading(true);
    try {
      console.log('🔥 Updating option:', optionId, data);
      
      const updatedOption = await optionService.updateOption(optionId, data);
      console.log('✅ Option updated:', updatedOption);
      
      const updatedOptions = localOptions.map(opt => 
        opt.id === optionId ? updatedOption : opt
      );
      setLocalOptions(updatedOptions);
      onOptionsUpdate?.(updatedOptions);
      
      setEditingOption(null);
    } catch (error) {
      console.error('❌ Error updating option:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    setLoading(true);
    try {
      console.log('🔥 Deleting option:', optionId);
      
      await optionService.deleteOption(optionId);
      console.log('✅ Option deleted');
      
      const updatedOptions = localOptions.filter(opt => opt.id !== optionId);
      setLocalOptions(updatedOptions);
      onOptionsUpdate?.(updatedOptions);
    } catch (error) {
      console.error('❌ Error deleting option:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (option: Option) => {
    setEditingOption(option);
    form.reset({
      text: option.text
    });
  };

  const cancelEditing = () => {
    setEditingOption(null);
    form.reset();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Opciones de respuesta</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <Plus className="h-3 w-3" />
          Agregar opción
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingOption) && (
        <div className="p-3 border rounded-lg bg-gray-50">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                editingOption
                  ? (data) => handleUpdateOption(editingOption.id, data)
                  : handleCreateOption
              )}
              className="space-y-3"
            >
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Texto de la opción</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Escribe la opción aquí..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={isCreating ? () => setIsCreating(false) : cancelEditing}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : isCreating ? 'Crear' : 'Actualizar'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {/* Options List */}
      <div className="space-y-2">
        {localOptions.length === 0 ? (
          <div className="p-3 text-center text-sm text-gray-500 border border-dashed rounded-lg">
            No hay opciones. Agrega la primera opción para esta pregunta.
          </div>
        ) : (
          localOptions.map((option, index) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-2 flex-1">
                <GripVertical className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">#{index + 1}</span>
                <span className="text-sm">{option.text}</span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(option)}
                  disabled={loading}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loading}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar opción?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará la opción
                        "{option.text}" de la pregunta.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteOption(option.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
