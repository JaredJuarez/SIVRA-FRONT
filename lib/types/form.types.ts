import { Question } from './question.types';

export interface Form {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  questions: Question[];
}

export interface CreateFormRequest {
  title: string;
  description?: string;
}

export interface UpdateFormRequest {
  title?: string;
  description?: string;
}