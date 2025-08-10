import { Option } from './option.types';

export interface Question {
  id: string;
  formId: string;
  title: string;
  type: 'single' | 'multiple' | 'text';
  required: boolean;
  order: number;
  options: Option[];
}

export interface CreateQuestionRequest {
  title: string;
  type: 'single' | 'multiple' | 'text';
  required: boolean;
  order: number;
}

export interface UpdateQuestionRequest {
  title?: string;
  type?: 'single' | 'multiple' | 'text';
  required?: boolean;
  order?: number;
}
