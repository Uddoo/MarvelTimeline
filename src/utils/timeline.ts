import type {
  Movie,
  SortMode,
  TimelineFilters,
} from "../types/movie";
import { watchlistDefinitions } from "../data/watchlists";

export const defaultFilters: TimelineFilters = {
  saga: "all",
  phase: "all",
  watchlist: "all",
  query: "",
};

const normalize = (value: string) => value.trim().toLocaleLowerCase();
const watchlistMovieIds = new Map(
  watchlistDefinitions.map((watchlist) => [
    watchlist.id,
    new Set(watchlist.movieIds),
  ]),
);

export function getVisibleMovies(
  source: Movie[],
  sortMode: SortMode,
  filters: TimelineFilters,
) {
  const query = normalize(filters.query);

  return source
    .filter((movie) => filters.saga === "all" || movie.saga === filters.saga)
    .filter((movie) => filters.phase === "all" || movie.phase === filters.phase)
    .filter(
      (movie) =>
        filters.watchlist === "all" ||
        watchlistMovieIds.get(filters.watchlist)?.has(movie.id),
    )
    .filter((movie) => {
      if (!query) return true;

      return [
        movie.title,
        movie.titleZh,
        movie.storyYear,
        movie.releaseYear.toString(),
        movie.phase,
        movie.saga,
        ...movie.characters,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query);
    })
    .sort((a, b) => {
      if (sortMode === "release") {
        return a.releaseDate.localeCompare(b.releaseDate);
      }

      return a.storyOrder - b.storyOrder;
    });
}
