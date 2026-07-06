import type { ButtonHTMLAttributes } from "react";
import { BUTTON_VARIANTS, ButtonVariant, ff } from "@/styles/tokens";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  block?: boolean;
}

/** 공숲 픽셀 버튼. variant: green | blue | red | wood */
export default function Button({ variant = "green", block, style, children, ...rest }: Props) {
  const v = BUTTON_VARIANTS[variant];
  return (
    <button
      {...rest}
      style={{
        padding: "8px 16px",
        fontSize: 12,
        fontWeight: 700,
        fontFamily: ff,
        cursor: "pointer",
        background: v.bg,
        color: v.tx,
        border: `2px solid ${v.br}`,
        boxShadow: `2px 2px 0 ${v.sh}`,
        width: block ? "100%" : undefined,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
