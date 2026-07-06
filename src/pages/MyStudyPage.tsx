import { useState } from "react";
import { HomePage as RichHome } from "@/legacy/GongsupScreens";
import { useTodos } from "@/context/TodosContext";

export default function MyStudyPage() {
  const { todos, add, remove } = useTodos();
  const [aiInput, setAiInput] = useState("");
  return <RichHome todos={todos} add={add} remove={remove} aiInput={aiInput} setAiInput={setAiInput} />;
}
