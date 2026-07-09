import { api } from "./client";

export interface TodoResponse {
  todoId: number;
  content: string;
  isDone: boolean;
  todoDate: string;
  createdAt: string;
}

export const todoApi = {
  list(date?: string) {
    return api.get<TodoResponse[]>("/todos", date ? { date } : undefined);
  },

  create(content: string, todoDate?: string) {
    return api.post<TodoResponse>("/todos", {
      content,
      todoDate,
    });
  },

  changeStatus(todoId: number, isDone: boolean) {
    return api.patch<TodoResponse>(`/todos/${todoId}/status`, {
      isDone,
    });
  },

  delete(todoId: number) {
    return api.del<void>(`/todos/${todoId}`);
  },
};