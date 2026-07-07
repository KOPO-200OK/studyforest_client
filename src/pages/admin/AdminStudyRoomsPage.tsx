import { useState } from "react";
import { Card } from "@/components/ui";
import { fs, ff, C } from "@/styles/tokens";
import { RAW_SEATS } from "@/legacy/GongsupScreens";
import { getDisabledSeatIds, setSeatDisabled } from "@/data/seatConfig";

export default function AdminStudyRoomsPage() {
  const [disabledIds, setDisabledIds] = useState(() => new Set(getDisabledSeatIds()));

  function toggle(seatId: number) {
    const next = !disabledIds.has(seatId);
    setSeatDisabled(seatId, next);
    setDisabledIds(new Set(getDisabledSeatIds()));
  }

  const zones = Array.from(new Set(RAW_SEATS.map((s) => s.zone)));

  return (
    <div>
      <p style={{ fontFamily: ff, color: "#9aaa80", fontSize: 12, marginBottom: 16 }}>
        좌석을 클릭하면 스터디룸에서 해당 좌석이 이용 불가(비활성화) 처리됩니다. 변경 사항은 스터디룸에 새로 입장할 때 반영됩니다.
      </p>

      {zones.map((zone) => (
        <Card key={zone} style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 13, color: "#2a1808", marginBottom: 10 }}>{zone}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {RAW_SEATS.filter((s) => s.zone === zone).map((s) => {
              const disabled = disabledIds.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  title={disabled ? "클릭하여 활성화" : "클릭하여 비활성화"}
                  style={{
                    width: 44, height: 44, fontSize: 12, fontWeight: 700, fontFamily: ff, cursor: "pointer",
                    background: disabled ? "rgba(90,54,30,0.4)" : "rgba(46,96,32,0.5)",
                    border: `2px solid ${disabled ? "#5a3a1a" : "#1a5010"}`,
                    color: disabled ? "#a89078" : "#c8e0b8",
                    textDecoration: disabled ? "line-through" : "none",
                  }}
                >
                  {s.id}
                </button>
              );
            })}
          </div>
        </Card>
      ))}

      <div style={{ display: "flex", gap: 14, fontSize: 11, fontFamily: ff, color: "#9aaa80" }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(46,96,32,0.5)", border: "2px solid #1a5010", marginRight: 4, verticalAlign: "middle" }} />이용 가능</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(90,54,30,0.4)", border: "2px solid #5a3a1a", marginRight: 4, verticalAlign: "middle" }} />비활성화됨</span>
      </div>
    </div>
  );
}
