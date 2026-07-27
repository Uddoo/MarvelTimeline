import type { WatchlistId } from "../types/movie";

interface WatchlistDefinition {
  id: WatchlistId;
  label: string;
  targetTitle: string;
  sourceWorkbook: string;
  movieIds: readonly string[];
}

export const watchlistDefinitions: readonly WatchlistDefinition[] = [
  {
    id: "brand-new-day",
    label: "崭新之日前置",
    targetTitle: "蜘蛛侠：崭新之日",
    sourceWorkbook: "蜘蛛侠_崭新之日前置片单.xlsx",
    movieIds: [
      "iron-man",
      "avengers",
      "avengers-age-of-ultron",
      "civil-war",
      "spider-man-homecoming",
      "doctor-strange",
      "thor-ragnarok",
      "avengers-infinity-war",
      "avengers-endgame",
      "spider-man-no-way-home",
    ],
  },
  {
    id: "doomsday",
    label: "毁灭日前置",
    targetTitle: "复仇者联盟 5：毁灭日",
    sourceWorkbook: "复仇者联盟5_毁灭日前置片单.xlsx",
    movieIds: [
      "captain-america-first-avenger",
      "iron-man",
      "thor",
      "avengers",
      "winter-soldier",
      "avengers-age-of-ultron",
      "ant-man",
      "civil-war",
      "black-panther",
      "doctor-strange",
      "thor-ragnarok",
      "avengers-infinity-war",
      "avengers-endgame",
      "shang-chi",
      "spider-man-no-way-home",
      "doctor-strange-multiverse",
      "black-panther-wakanda-forever",
    ],
  },
];
