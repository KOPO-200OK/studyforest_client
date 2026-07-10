import { useState } from "react";
import { StudyRoomPage as RichStudyRoom } from "@/legacy/GongsupScreens";
import { useTodos } from "@/context/TodosContext";
import { mockAuthApi } from "@/api/mockAuthApi";
import { DEFAULT_CHARACTER_ID } from "@/data/characters";

export default function StudyRoomPage() {
  const { todos, add, remove } = useTodos();
  const [char, setChar] = useState(() => mockAuthApi.getCurrentAccount()?.characterId ?? DEFAULT_CHARACTER_ID);

  async function handleSetChar(id: number) {
    const previous = char;
    setChar(id);
    const email = mockAuthApi.getCurrentEmail();
    if (!email) return;
    try {
      await mockAuthApi.setCharacter(email, id);
    } catch (error) {
      setChar(previous);
      throw error;
    }
  }

  return <RichStudyRoom todos={todos} add={add} remove={remove} char={char} setChar={handleSetChar} />;
}
