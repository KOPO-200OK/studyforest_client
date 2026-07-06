import { useState } from "react";
import { StudyRoomPage as RichStudyRoom } from "@/legacy/GongsupScreens";
import { useTodos } from "@/context/TodosContext";

export default function StudyRoomPage() {
  const { todos, add, remove } = useTodos();
  const [char, setChar] = useState(5); // 기본: 유생 남
  return <RichStudyRoom todos={todos} add={add} remove={remove} char={char} setChar={setChar} />;
}
