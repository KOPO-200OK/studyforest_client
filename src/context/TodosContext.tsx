import { createContext, useContext, useState, type ReactNode } from "react";

export interface Todo { id: number; text: string; }

const INITIAL: Todo[] = [
  { id: 1, text: "구석기~청동기 개념 정리" },
  { id: 2, text: "삼국시대 왕 계보 암기" },
  { id: 3, text: "고려시대 오답 정리" },
  { id: 4, text: "조선시대 사화 문제 풀기" },
  { id: 5, text: "근현대 모의고사 1회" },
];

interface Ctx {
  todos: Todo[];
  add: (text: string) => void;
  remove: (id: number) => void;
}
const TodosCtx = createContext<Ctx | null>(null);

export function TodosProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>(INITIAL);
  const add = (text: string) => setTodos(ts => [...ts, { id: Date.now(), text }]);
  const remove = (id: number) => setTodos(ts => ts.filter(t => t.id !== id));
  return <TodosCtx.Provider value={{ todos, add, remove }}>{children}</TodosCtx.Provider>;
}

export function useTodos() {
  const ctx = useContext(TodosCtx);
  if (!ctx) throw new Error("useTodos must be used within TodosProvider");
  return ctx;
}
