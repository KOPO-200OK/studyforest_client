import type { InputHTMLAttributes } from "react";
import { C, ff } from "@/styles/tokens";

/** 공숲 한지 입력창 */
export default function Input({ style, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      style={{
        fontSize: 12,
        padding: "8px 12px",
        background: C.inputBg,
        border: `1px solid ${C.inputBr}`,
        outline: "none",
        color: C.inkDark,
        fontFamily: ff,
        ...style,
      }}
    />
  );
}
