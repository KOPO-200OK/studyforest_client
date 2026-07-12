import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Card } from "@/components/ui";
import { fs, ff } from "@/styles/tokens";

import {
  RAW_SEATS,
  SEODANG_SEATS,
  CAFE_SEATS,
  SA_SEATS,
} from "@/legacy/GongsupScreens";

import {
  adminStudyRoomApi,
  type AdminSeatResponse,
} from "@/api/adminStudyRoomApi";

const MAP_SEAT_GROUPS = [
  {
    mapNo: 1,
    mapLabel: "🌲 공숲",
    seats: RAW_SEATS,
  },
  {
    mapNo: 2,
    mapLabel: "📜 서당",
    seats: SEODANG_SEATS,
  },
  {
    mapNo: 3,
    mapLabel: "☕ 카페",
    seats: CAFE_SEATS,
  },
  {
    mapNo: 4,
    mapLabel: "🏢 오피스",
    seats: SA_SEATS,
  },
];

function seatKey(
  mapNo: number,
  seatNo: number,
): string {
  return `${mapNo}:${seatNo}`;
}

export default function AdminStudyRoomsPage() {
  const [
    seats,
    setSeats,
  ] = useState<
    AdminSeatResponse[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingSeatId,
    setUpdatingSeatId,
  ] = useState<
    number | null
  >(null);

  /**
   * 화면의 좌석 번호와 DB 좌석 정보를
   * MAP_NO + SEAT_NO 기준으로 연결합니다.
   */
  const seatByMapAndNumber =
    useMemo(
      () =>
        new Map(
          seats.map(
            (seat) => [
              seatKey(
                seat.mapNo,
                seat.seatNo,
              ),
              seat,
            ],
          ),
        ),
      [seats],
    );

  /**
   * 관리자 화면 진입 시 DB의 실제 좌석 상태를 조회합니다.
   */
  useEffect(() => {
    let cancelled =
      false;

    async function loadSeats() {
      setLoading(true);

      try {
        const loadedSeats =
          await adminStudyRoomApi
            .getSeats();

        if (!cancelled) {
          setSeats(
            loadedSeats,
          );
        }
      } catch (error) {
        if (!cancelled) {
          window.alert(
            error instanceof Error
              ? error.message
              : "좌석 정보를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSeats();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * 좌석을 클릭하면 서버의 SEAT.IS_ACTIVE를 변경합니다.
   */
  async function toggle(
    mapNo: number,
    seatNo: number,
  ) {
    if (
      loading ||
      updatingSeatId !== null
    ) {
      return;
    }

    const seat =
      seatByMapAndNumber.get(
        seatKey(
          mapNo,
          seatNo,
        ),
      );

    if (!seat) {
      window.alert(
        "DB에 연결된 좌석 정보를 찾을 수 없습니다.",
      );

      return;
    }

    const nextActive =
      !seat.active;

    if (
      !nextActive &&
      seat.occupied
    ) {
      window.alert(
        "현재 사용 중인 좌석은 비활성화할 수 없습니다.",
      );

      return;
    }

    setUpdatingSeatId(
      seat.seatId,
    );

    try {
      const updatedSeat =
        await adminStudyRoomApi
          .updateSeatActive(
            seat.seatId,
            nextActive,
          );

      setSeats(
        (current) =>
          current.map(
            (item) =>
              item.seatId ===
              updatedSeat.seatId
                ? updatedSeat
                : item,
          ),
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "좌석 상태를 변경하지 못했습니다.",
      );
    } finally {
      setUpdatingSeatId(
        null,
      );
    }
  }

  return (
    <div>
      <p style={{ fontFamily: ff, color: "#9aaa80", fontSize: 12, marginBottom: 16 }}>
        좌석을 클릭하면 스터디룸에서 해당 좌석이 이용 불가(비활성화) 처리됩니다. 변경 사항은 스터디룸에 새로 입장할 때 반영됩니다.
      </p>

      {MAP_SEAT_GROUPS.map(({ mapNo, mapLabel, seats: mapSeats }) => {
        const zones = Array.from(new Set(mapSeats.map((s) => s.zone)));
        return (
        <div key={mapLabel} style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 14, color: "#f5e6c8", marginBottom: 10 }}>{mapLabel}</div>
          {zones.map((zone) => (
        <Card key={zone} style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: fs, fontWeight: 700, fontSize: 13, color: "#2a1808", marginBottom: 10 }}>{zone}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {mapSeats.filter((s) => s.zone === zone).map((s) => {
              const serverSeat = seatByMapAndNumber.get(
                seatKey(mapNo, s.id),
              );

              const disabled =
                serverSeat
                  ? !serverSeat.active
                  : false;

              const updating =
                updatingSeatId ===
                serverSeat?.seatId;

              return (
                <button
                  key={s.id}
                  onClick={() =>
                    void toggle(
                      mapNo,
                      s.id,
                    )
                  }
                  title={
                    serverSeat?.occupied
                      ? "현재 사용 중인 좌석"
                      : disabled
                        ? "클릭하여 활성화"
                        : "클릭하여 비활성화"
                  }
                  style={{
                    width: 44, height: 44, fontSize: 12, fontWeight: 700, fontFamily: ff,
                    cursor: loading || updating ? "wait" : "pointer",
                    background: disabled ? "rgba(90,54,30,0.4)" : "rgba(46,96,32,0.5)",
                    border: `2px solid ${disabled ? "#5a3a1a" : "#1a5010"}`,
                    color: disabled ? "#a89078" : "#c8e0b8",
                    textDecoration: disabled ? "line-through" : "none",
                    opacity: updating ? 0.65 : 1,
                  }}
                >
                  {s.id}
                </button>
              );
            })}
          </div>
        </Card>
          ))}
        </div>
        );
      })}

      <div style={{ display: "flex", gap: 14, fontSize: 11, fontFamily: ff, color: "#9aaa80" }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(46,96,32,0.5)", border: "2px solid #1a5010", marginRight: 4, verticalAlign: "middle" }} />이용 가능</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(90,54,30,0.4)", border: "2px solid #5a3a1a", marginRight: 4, verticalAlign: "middle" }} />비활성화됨</span>
      </div>
    </div>
  );
}