export type Saga = "Infinity Saga" | "Multiverse Saga";

export type Phase =
  | "Phase One"
  | "Phase Two"
  | "Phase Three"
  | "Phase Four"
  | "Phase Five";

export type SortMode = "story" | "release";

export type WatchlistId = "brand-new-day" | "doomsday";

export type WatchlistFilter = "all" | WatchlistId;

export interface Movie {
  id: string;
  title: string;
  titleZh: string;
  storyYear: string;
  storyOrder: number;
  releaseDate: string;
  releaseYear: number;
  phase: Phase;
  saga: Saga;
  poster: string;
  synopsis: string;
  events: string[];
  characters: string[];
  relatedIds: string[];
}

export interface TimelineFilters {
  saga: "all" | Saga;
  phase: "all" | Phase;
  watchlist: WatchlistFilter;
  query: string;
}

export interface TimelineViewport {
  scrollLeft: number;
  scrollWidth: number;
  clientWidth: number;
}
