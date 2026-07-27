import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CosmicBackdrop } from "./components/CosmicBackdrop";
import { DetailDrawer } from "./components/DetailDrawer";
import { HeaderControls } from "./components/HeaderControls";
import { MiniTimeline } from "./components/MiniTimeline";
import { ScreenReaderTimeline } from "./components/ScreenReaderTimeline";
import { TimelineStage } from "./components/TimelineStage";
import { movies } from "./data/movies";
import type {
  Movie,
  SortMode,
  TimelineFilters,
  TimelineViewport,
} from "./types/movie";
import { defaultFilters, getVisibleMovies } from "./utils/timeline";

const emptyViewport: TimelineViewport = {
  scrollLeft: 0,
  scrollWidth: 0,
  clientWidth: 0,
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function App() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [sortMode, setSortMode] = useState<SortMode>("story");
  const [filters, setFilters] = useState<TimelineFilters>(defaultFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(movies[0].id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pulseVersion, setPulseVersion] = useState(0);
  const [viewport, setViewport] =
    useState<TimelineViewport>(emptyViewport);

  const visibleMovies = useMemo(
    () => getVisibleMovies(movies, sortMode, filters),
    [filters, sortMode],
  );

  const selectedMovie =
    movies.find((movie) => movie.id === selectedId) ?? null;
  const relatedMovies = selectedMovie
    ? selectedMovie.relatedIds
        .map((id) => movies.find((movie) => movie.id === id))
        .filter((movie): movie is Movie => Boolean(movie))
    : [];

  const scrollToMovie = useCallback((id: string) => {
    window.requestAnimationFrame(() => {
      const timeline = timelineRef.current;
      const slot = timeline?.querySelector<HTMLElement>(
        `[data-movie-id="${id}"]`,
      );
      if (!timeline || !slot) return;

      const target =
        slot.offsetLeft + slot.offsetWidth / 2 - timeline.clientWidth / 2;
      timeline.scrollTo({
        left: target,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
      slot.querySelector<HTMLButtonElement>(".movie-node")?.focus({
        preventScroll: true,
      });
    });
  }, []);

  const selectMovie = useCallback(
    (movie: Movie) => {
      setSelectedId(movie.id);
      setCurrentId(movie.id);
      setDrawerOpen(true);
      setPulseVersion((version) => version + 1);
      scrollToMovie(movie.id);
    },
    [scrollToMovie],
  );

  const selectRelatedMovie = (movie: Movie) => {
    const isVisible = visibleMovies.some((item) => item.id === movie.id);
    if (!isVisible) {
      setFilters(defaultFilters);
      setSortMode("story");
    }
    setSelectedId(movie.id);
    setCurrentId(movie.id);
    setDrawerOpen(true);
    setPulseVersion((version) => version + 1);
  };

  const navigate = useCallback(
    (direction: -1 | 1) => {
      if (visibleMovies.length === 0) return;
      const activeId = selectedId ?? currentId;
      const activeIndex = Math.max(
        0,
        visibleMovies.findIndex((movie) => movie.id === activeId),
      );
      const nextIndex = Math.min(
        visibleMovies.length - 1,
        Math.max(0, activeIndex + direction),
      );
      selectMovie(visibleMovies[nextIndex]);
    },
    [currentId, selectMovie, selectedId, visibleMovies],
  );

  const reset = () => {
    setFilters(defaultFilters);
    setSortMode("story");
    setSelectedId(null);
    setDrawerOpen(false);
    setCurrentId(movies[0].id);
    window.requestAnimationFrame(() => {
      timelineRef.current?.scrollTo({
        left: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    });
  };

  useEffect(() => {
    if (visibleMovies.length === 0) {
      setCurrentId(null);
      setSelectedId(null);
      setDrawerOpen(false);
      return;
    }

    if (!visibleMovies.some((movie) => movie.id === currentId)) {
      setCurrentId(visibleMovies[0].id);
    }
    if (
      selectedId &&
      !visibleMovies.some((movie) => movie.id === selectedId)
    ) {
      setSelectedId(null);
      setDrawerOpen(false);
    }
  }, [currentId, selectedId, visibleMovies]);

  useEffect(() => {
    if (selectedId && visibleMovies.some((movie) => movie.id === selectedId)) {
      scrollToMovie(selectedId);
    }
  }, [scrollToMovie, selectedId, visibleMovies]);

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="app-shell" data-drawer-open={drawerOpen}>
      <CosmicBackdrop />
      <HeaderControls
        sortMode={sortMode}
        filters={filters}
        resultCount={visibleMovies.length}
        onSortChange={setSortMode}
        onFiltersChange={setFilters}
        onReset={reset}
      />

      <main className="timeline-region">
        <TimelineStage
          movies={visibleMovies}
          sortMode={sortMode}
          selectedId={selectedId}
          currentId={currentId}
          pulseVersion={pulseVersion}
          timelineRef={timelineRef}
          onSelect={selectMovie}
          onBrowse={setCurrentId}
          onNavigate={navigate}
          onViewportChange={setViewport}
        />

        {visibleMovies.length === 0 && (
          <div className="timeline-empty" role="status">
            <span aria-hidden="true" />
            <h2>此时间段没有匹配的电影</h2>
            <p>调整 Saga、Phase 或搜索关键词后再试。</p>
            <button type="button" onClick={reset}>
              重置筛选
            </button>
          </div>
        )}

        <DetailDrawer
          movie={selectedMovie}
          relatedMovies={relatedMovies}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onRelatedSelect={selectRelatedMovie}
        />
      </main>

      <MiniTimeline
        movies={visibleMovies}
        currentId={currentId}
        timelineRef={timelineRef}
        viewport={viewport}
        onSelect={selectMovie}
      />
      <ScreenReaderTimeline movies={visibleMovies} />

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {selectedMovie
          ? `已打开 ${selectedMovie.titleZh} 详情，剧情时间 ${selectedMovie.storyYear}`
          : "电影详情已关闭"}
      </div>
    </div>
  );
}
