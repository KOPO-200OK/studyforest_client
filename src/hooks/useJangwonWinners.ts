import {
  useEffect,
  useState,
} from "react";

import {
  jangwonApi,
  type JangwonWinnerResponse,
} from "@/api/jangwonApi";

let winnerCache: JangwonWinnerResponse[] = [];
let cacheLoaded = false;

let loadingRequest:
  Promise<JangwonWinnerResponse[]> | null = null;

const listeners = new Set<
  (
    winners: JangwonWinnerResponse[],
  ) => void
>();

function publishWinners() {
  const snapshot =
    winnerCache.slice();

  listeners.forEach(
    (listener) => {
      listener(snapshot);
    },
  );
}

/**
 * 공개 장원급제 명단의 전체 페이지를 조회합니다.
 *
 * 백엔드에서는 페이지 크기를 최대 50으로 제한하므로
 * totalPages만큼 반복해서 조회합니다.
 */
async function requestAllWinners():
  Promise<JangwonWinnerResponse[]> {
  const firstPage =
    await jangwonApi.listWinners({
      page: 0,
      size: 50,
    });

  const winners = [
    ...firstPage.content,
  ];

  for (
    let pageNumber = 1;
    pageNumber <
    firstPage.totalPages;
    pageNumber += 1
  ) {
    const nextPage =
      await jangwonApi.listWinners({
        page: pageNumber,
        size: 50,
      });

    winners.push(
      ...nextPage.content,
    );
  }

  return winners;
}

/**
 * 공개 장원급제 명단을 불러옵니다.
 *
 * force가 false이면 이미 조회한 캐시를 사용합니다.
 */
export async function loadJangwonWinners(
  force = false,
): Promise<JangwonWinnerResponse[]> {
  if (
    cacheLoaded &&
    !force
  ) {
    return winnerCache.slice();
  }

  if (
    loadingRequest &&
    !force
  ) {
    return loadingRequest;
  }

  loadingRequest =
    requestAllWinners()
      .then(
        (winners) => {
          winnerCache =
            winners;

          cacheLoaded =
            true;

          publishWinners();

          return winnerCache.slice();
        },
      )
      .finally(() => {
        loadingRequest =
          null;
      });

  return loadingRequest;
}

/**
 * 관리자 승인 또는 승인 내역 삭제 후
 * 공개 장원급제 명단을 강제로 갱신합니다.
 */
export async function refreshJangwonWinners():
  Promise<JangwonWinnerResponse[]> {
  cacheLoaded = false;

  return loadJangwonWinners(
    true,
  );
}

/**
 * 장원급제 공개 명단을 React 상태로 사용합니다.
 */
export function useJangwonWinners():
  JangwonWinnerResponse[] {
  const [
    winners,
    setWinners,
  ] = useState<
    JangwonWinnerResponse[]
  >(
    () =>
      winnerCache.slice(),
  );

  useEffect(() => {
    let active = true;

    const listener = (
      nextWinners:
        JangwonWinnerResponse[],
    ) => {
      if (active) {
        setWinners(
          nextWinners,
        );
      }
    };

    listeners.add(
      listener,
    );

    void loadJangwonWinners()
      .then(
        (
          loadedWinners,
        ) => {
          if (active) {
            setWinners(
              loadedWinners,
            );
          }
        },
      )
      .catch(() => {
        if (active) {
          setWinners([]);
        }
      });

    return () => {
      active = false;

      listeners.delete(
        listener,
      );
    };
  }, []);

  return winners;
}

/**
 * 특정 사용자가 승인된 장원급제 명단에 있는지 확인합니다.
 *
 * memberId가 있으면 memberId를 우선 사용하고,
 * 이전 데이터 호환을 위해 닉네임도 확인합니다.
 */
export function useIsJangwonWinner(
  memberId?: number,
  nickname?: string | null,
): boolean {
  const winners =
    useJangwonWinners();

  const normalizedNickname =
    nickname?.trim();

  return winners.some(
    (winner) => {
      if (
        memberId !== undefined &&
        winner.memberId ===
          memberId
      ) {
        return true;
      }

      return Boolean(
        normalizedNickname &&
          winner
            .displayNickname
            .trim() ===
            normalizedNickname,
      );
    },
  );
}