import {
  useState,
} from "react";

import {
  StudyRoomPage as RichStudyRoom,
} from "@/legacy/GongsupScreens";

import {
  useTodos,
} from "@/context/TodosContext";

import {
  mockAuthApi,
} from "@/api/mockAuthApi";

import {
  DEFAULT_CHARACTER_ID,
} from "@/data/characters";

export default function StudyRoomPage() {
  const {
    todos,
    add,
    remove,
  } = useTodos();

  const [
    char,
    setChar,
  ] = useState(
    () =>
      mockAuthApi
        .getCurrentAccount()
        ?.characterId ??
      DEFAULT_CHARACTER_ID,
  );

  /**
   * 실제 서버 저장은 CharSelectModal에서 수행합니다.
   * 이 함수는 저장 성공 후 화면 상태만 갱신합니다.
   */
  function handleSetChar(
    id: number,
  ) {
    setChar(id);
  }

  return (
    <RichStudyRoom
      todos={todos}
      add={add}
      remove={remove}
      char={char}
      setChar={handleSetChar}
    />
  );
}