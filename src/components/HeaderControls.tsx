import { Icon } from "./Icon";
import { phaseOptions, sagaOptions } from "../data/movies";
import { watchlistDefinitions } from "../data/watchlists";
import type {
  Phase,
  Saga,
  SortMode,
  TimelineFilters,
  WatchlistFilter,
} from "../types/movie";

interface HeaderControlsProps {
  sortMode: SortMode;
  filters: TimelineFilters;
  resultCount: number;
  onSortChange: (mode: SortMode) => void;
  onFiltersChange: (filters: TimelineFilters) => void;
  onReset: () => void;
}

export function HeaderControls({
  sortMode,
  filters,
  resultCount,
  onSortChange,
  onFiltersChange,
  onReset,
}: HeaderControlsProps) {
  const hasFilters =
    sortMode !== "story" ||
    filters.saga !== "all" ||
    filters.phase !== "all" ||
    filters.watchlist !== "all" ||
    filters.query.length > 0;

  return (
    <header className="topbar">
      <div className="brand-lockup">
        <div className="brand-lockup__mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div>
          <h1>MCU Chronicle</h1>
          <p>漫威电影宇宙横向时间线</p>
        </div>
        <output className="brand-lockup__count" aria-live="polite">
          {resultCount} 部
        </output>
      </div>

      <div className="topbar__controls" aria-label="时间线筛选与排序">
        <div className="sort-switch" aria-label="排序方式">
          <button
            type="button"
            className={sortMode === "story" ? "is-active" : ""}
            aria-pressed={sortMode === "story"}
            onClick={() => onSortChange("story")}
          >
            剧情时间
          </button>
          <button
            type="button"
            className={sortMode === "release" ? "is-active" : ""}
            aria-pressed={sortMode === "release"}
            onClick={() => onSortChange("release")}
          >
            上映时间
          </button>
        </div>

        <label className="select-control select-control--watchlist">
          <span>前置片单</span>
          <select
            value={filters.watchlist}
            aria-label="按前置片单筛选"
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                watchlist: event.target.value as WatchlistFilter,
              })
            }
          >
            <option value="all">全部片单</option>
            {watchlistDefinitions.map((watchlist) => (
              <option key={watchlist.id} value={watchlist.id}>
                {watchlist.label} · {watchlist.movieIds.length} 部
              </option>
            ))}
          </select>
        </label>

        <label className="select-control">
          <span>Saga</span>
          <select
            value={filters.saga}
            aria-label="按 Saga 筛选"
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                saga: event.target.value as "all" | Saga,
              })
            }
          >
            <option value="all">全部</option>
            {sagaOptions.map((saga) => (
              <option key={saga} value={saga}>
                {saga}
              </option>
            ))}
          </select>
        </label>

        <label className="select-control">
          <span>Phase</span>
          <select
            value={filters.phase}
            aria-label="按 Phase 筛选"
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                phase: event.target.value as "all" | Phase,
              })
            }
          >
            <option value="all">全部</option>
            {phaseOptions.map((phase) => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </select>
        </label>

        <label className="search-control">
          <Icon name="search" />
          <span className="sr-only">搜索电影</span>
          <input
            type="search"
            value={filters.query}
            placeholder="搜索电影或人物"
            onChange={(event) =>
              onFiltersChange({ ...filters, query: event.target.value })
            }
          />
        </label>

        <button
          type="button"
          className="reset-control"
          onClick={onReset}
          disabled={!hasFilters}
        >
          <Icon name="reset" />
          <span>重置筛选</span>
        </button>
      </div>
    </header>
  );
}
