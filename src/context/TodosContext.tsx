import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { todoApi } from "@/api/todoApi";
import { tokenStore } from "@/api/client";

export interface Todo {
  id: number;
  text: string;
}

interface Ctx {
  todos: Todo[];
  add: (text: string) => void;
  remove: (id: number) => void;
}

const TodosCtx = createContext<Ctx | null>(null);

function toTodo(response: { todoId: number; content: string }): Todo {
  return {
    id: response.todoId,
    text: response.content,
  };
}

export function TodosProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);

  async function loadTodos() {
    if (!tokenStore.get()) return;

    const responses = await todoApi.list();
    setTodos(responses.map(toTodo));
  }

  useEffect(() => {
    void loadTodos();
  }, []);

  const add = (text: string) => {
    const content = text.trim();
    if (!content) return;

    void todoApi.create(content)
      .then((created) => {
        setTodos((current) => [...current, toTodo(created)]);
      })
      .catch((err) => {
        alert(err instanceof Error ? err.message : "할 일 추가에 실패했습니다");
      });
  };

  const remove = (id: number) => {
    void todoApi.delete(id)
      .then(() => {
        setTodos((current) => current.filter((todo) => todo.id !== id));
      })
      .catch((err) => {
        alert(err instanceof Error ? err.message : "할 일 삭제에 실패했습니다");
      });
  };

  return (
    <TodosCtx.Provider value={{ todos, add, remove }}>
      {children}
    </TodosCtx.Provider>
  );
}

export function useTodos() {
  const ctx = useContext(TodosCtx);
  if (!ctx) throw new Error("useTodos must be used within TodosProvider");
  return ctx;
}