export interface Response {
  id: string;
  formId: string;
  userId?: string;
  answers: Answer[];
  createdAt: string;
}

export interface Answer {
  questionId: string;
  optionIds?: string[];
  textValue?: string;
}

export interface CreateResponseRequest {
  answers: Answer[];
}
