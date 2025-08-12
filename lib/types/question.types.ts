import { Option } from './option.types';

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT';

export interface Question {
  id: string;
  formId: string;
  text: string;
  type: QuestionType;
  required: boolean;
  order: number;
  options?: Option[];
}

export interface CreateQuestionRequest {
  text: string;
  type: QuestionType;
  required: boolean;
  order: number;
}

export interface UpdateQuestionRequest {
  text?: string;
  type?: QuestionType;
  required?: boolean;
  order?: number;
}
