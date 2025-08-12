import { Question } from './question.types';

export interface Form {
  id: string;
  title: string;
  description: string;
  type: string;
  open?: string; // LocalDateTime como ISO string
  closed?: string; // LocalDateTime como ISO string
  created?: string; // LocalDateTime como ISO string
  expired?: string; // LocalDateTime como ISO string
  questions?: Question[];
}

export interface CreateFormRequest {
  title: string;
  description: string;
  type: string;
  open?: string; // LocalDateTime como ISO string
  closed?: string; // LocalDateTime como ISO string
}

export interface UpdateFormRequest {
  title: string;
  description: string;
  type: string;
  open?: string; // LocalDateTime como ISO string
  closed?: string; // LocalDateTime como ISO string
}

export interface FormResponse {
  id: number; // Long del backend
  title: string;
  description: string;
  type: string;
  open?: string;
  closed?: string;
  questions?: Question[];
}
