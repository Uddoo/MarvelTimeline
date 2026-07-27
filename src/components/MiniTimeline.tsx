import {
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import type { Movie, TimelineViewport } from "../types/movie";

interface MiniTimelineProps {
  movies: Movie[];
  currentId: string | null;
  timelineRef: RefObject<HTMLDivElement | null>;
  viewport: TimelineViewport;
  onSelect: (movie: Movie) => void;
}

export function MiniTimeline({
  movies,
  currentId,
  timelineRef,
  viewport,
  onSelect,
}: MiniTimelineProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef(0);
  const dragging = useRef(false);

  const current = movies.find((movie) => movie.id === currentId) ?? movies[0];
  const viewportWidth =
    viewport.scrollWidth > 0
      ? Math.min(100, (viewport.clientWidth / viewport.scrollWidth) * 100)
      : 100;
  const viewportLeft =
    viewport.scrollWidth > 0
      ? (viewport.scrollLeft / viewport.scrollWidth) * 100
      : 0;
  const maxScroll = Math.max(
    0,
    viewport.scrollWidth - viewport.clientWidth,
  );
  const sliderValue =
    maxScroll > 0 ? Math.round((viewport.scrollLeft / maxScroll) * 100) : 0;

  const sagaRanges = useMemo(() => {
    return ["Infinity Saga", "Multiverse Saga"]
      .map((saga) => {
        const indexes = movies
          .map((movie, index) => (movie.saga === saga ? index : -1))
          .filter((index) => index >= 0);
        if (indexes.length === 0) return null;

        const start = Math.min(...indexes);
        const end = Math.max(...indexes) + 1;
        return {
          name: saga,
          left: (start / movies.length) * 100,
          width: ((end - start) / movies.length) * 100,
        };
      })
      .filter(Boolean) as Array<{ name: string; left: number; width: number }>;
  }, [movies]);

  const seek = (leftPercent: number) => {
    const timeline = timelineRef.current;
    if (!timeline || timeline.scrollWidth <= timeline.clientWidth) return;
    const liveViewportWidth = Math.min(
      100,
      (timeline.clientWidth / timeline.scrollWidth) * 100,
    );
    const maxLeftPercent = Math.max(0, 100 - liveViewportWidth);
    const safeLeft = Math.min(maxLeftPercent, Math.max(0, leftPercent));
    timeline.scrollLeft = (safeLeft / 100) * timeline.scrollWidth;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail) return;

    rail.setPointerCapture(event.pointerId);
    const bounds = rail.getBoundingClientRect();
    const cursorPercent = ((event.clientX - bounds.left) / bounds.width) * 100;
    const clickedViewport = (event.target as HTMLElement).closest(
      ".mini-timeline__viewport",
    );

    dragging.current = true;
    dragOffset.current = clickedViewport
      ? cursorPercent - viewportLeft
      : viewportWidth / 2;
    seek(cursorPercent - dragOffset.current);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || !dragging.current) return;

    const bounds = rail.getBoundingClientRect();
    const cursorPercent = ((event.clientX - bounds.left) / bounds.width) * 100;
    seek(cursorPercent - dragOffset.current);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    dragging.current = false;
    if (rail?.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }
  };

  const handleSliderKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    seek(viewportLeft + (event.key === "ArrowLeft" ? -5 : 5));
  };

  return (
    <section className="mini-timeline" aria-label="时间线总览与定位">
      <div className="mini-timeline__header">
        <div className="mini-timeline__sagas" aria-hidden="true">
          {sagaRanges.map((range) => (
            <span
              key={range.name}
              style={
                {
                  "--range-left": `${range.left}%`,
                  "--range-width": `${range.width}%`,
                } as CSSProperties
              }
            >
              {range.name === "Infinity Saga"
                ? "Infinity Saga · 无限传奇"
                : "Multiverse Saga · 多元宇宙传奇"}
            </span>
          ))}
        </div>
        <p aria-live="polite">
          <span>当前节点</span>
          <strong>{current ? current.titleZh : "无匹配电影"}</strong>
        </p>
      </div>

      <div
        ref={railRef}
        className="mini-timeline__rail"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <span className="mini-timeline__axis" aria-hidden="true" />
        {movies.map((movie, index) => (
          <button
            key={movie.id}
            type="button"
            className="mini-timeline__tick"
            data-current={movie.id === currentId}
            style={
              {
                "--tick-position": `${((index + 0.5) / movies.length) * 100}%`,
              } as CSSProperties
            }
            aria-label={`定位到 ${movie.titleZh}`}
            tabIndex={-1}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(movie);
            }}
          />
        ))}
        <div
          className="mini-timeline__viewport"
          role="slider"
          tabIndex={0}
          aria-label="拖动浏览时间轴"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={sliderValue}
          onKeyDown={handleSliderKeyDown}
          style={
            {
              "--viewport-left": `${viewportLeft}%`,
              "--viewport-width": `${viewportWidth}%`,
            } as CSSProperties
          }
        >
          <span />
        </div>
      </div>
    </section>
  );
}
