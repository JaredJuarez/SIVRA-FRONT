export interface Option {
  id: string;
  questionId: string;
  text: string;
  order: number;
}

export interface CreateOptionRequest {
  text: string;
  order: number;
}

export interface UpdateOptionRequest {
  text?: string;
  order?: number;
}
