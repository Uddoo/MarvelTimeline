import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import type { Movie, SortMode, TimelineViewport } from "../types/movie";
import { EnergyLine } from "./EnergyLine";
import { Icon } from "./Icon";
import { TimelineNode } from "./TimelineNode";

interface TimelineStageProps {
  movies: Movie[];
  sortMode: SortMode;
  selectedId: string | null;
  currentId: string | null;
  pulseVersion: number;
  timelineRef: RefObject<HTMLDivElement | null>;
  onSelect: (movie: Movie) => void;
  onBrowse: (id: string) => void;
  onNavigate: (direction: -1 | 1) => void;
  onViewportChange: (viewport: TimelineViewport) => void;
}

export function TimelineStage({
  movies,
  sortMode,
  selectedId,
  currentId,
  pulseVersion,
  timelineRef,
  onSelect,
  onBrowse,
  onNavigate,
  onViewportChange,
}: TimelineStageProps) {
  const dragState = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
  });
  const animationFrame = useRef<number | null>(null);
  const [pulseTarget, setPulseTarget] = useState<number | null>(null);

  const selectedIndex = movies.findIndex((movie) => movie.id === selectedId);
  const currentIndex = movies.findIndex((movie) => movie.id === currentId);

  useLayoutEffect(() => {
    const timeline = timelineRef.current;
    const content = timeline?.querySelector<HTMLElement>(".timeline-content");
    const selectedSlot = selectedId
      ? Array.from(
          timeline?.querySelectorAll<HTMLElement>("[data-timeline-slot]") ?? [],
        ).find((slot) => slot.dataset.movieId === selectedId)
      : null;

    if (!content || !selectedSlot) {
      setPulseTarget(null);
      return;
    }

    const updateTarget = () => {
      const target =
        ((selectedSlot.offsetLeft + selectedSlot.offsetWidth / 2) /
          content.scrollWidth) *
        100;
      setPulseTarget(target);
    };

    updateTarget();
    const resizeObserver = new ResizeObserver(updateTarget);
    resizeObserver.observe(content);
    return () => resizeObserver.disconnect();
  }, [movies, pulseVersion, selectedId, timelineRef]);

  useEffect(() => {
    const element = timelineRef.current;
    if (!element) return;

    const reportPosition = () => {
      animationFrame.current = null;
      const viewport = {
        scrollLeft: element.scrollLeft,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      };
      onViewportChange(viewport);

      const center = element.scrollLeft + element.clientWidth / 2;
      const slots = Array.from(
        element.querySelectorAll<HTMLElement>("[data-timeline-slot]"),
      );
      const closest = slots.reduce<HTMLElement | null>((best, slot) => {
        if (!best) return slot;
        const distance = Math.abs(slot.offsetLeft + slot.offsetWidth / 2 - center);
        const bestDistance = Math.abs(
          best.offsetLeft + best.offsetWidth / 2 - center,
        );
        return distance < bestDistance ? slot : best;
      }, null);

      const movieId = closest?.dataset.movieId;
      if (movieId) onBrowse(movieId);
    };

    const scheduleReport = () => {
      if (animationFrame.current !== null) return;
      animationFrame.current = window.requestAnimationFrame(reportPosition);
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || element.scrollWidth <= element.clientWidth) return;
      const primaryDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (primaryDelta === 0) return;
      event.preventDefault();
      element.scrollLeft += primaryDelta;
    };

    element.addEventListener("scroll", scheduleReport, { passive: true });
    element.addEventListener("wheel", handleWheel, { passive: false });
    scheduleReport();

    const resizeObserver = new ResizeObserver(scheduleReport);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener("scroll", scheduleReport);
      element.removeEventListener("wheel", handleWheel);
      resizeObserver.disconnect();
      if (animationFrame.current !== null) {
        window.cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };
  }, [movies, onBrowse, onViewportChange, timelineRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.matches("input, select, textarea")) return;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      onNavigate(event.key === "ArrowLeft" ? -1 : 1);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button, input, select")) return;

    const element = timelineRef.current;
    if (!element) return;

    dragState.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: element.scrollLeft,
    };
    element.dataset.dragging = "true";
    element.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const element = timelineRef.current;
    const drag = dragState.current;
    if (!element || !drag.active || drag.pointerId !== event.pointerId) return;

    element.scrollLeft =
      drag.startScrollLeft - (event.clientX - drag.startX);
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    const element = timelineRef.current;
    if (!element || dragState.current.pointerId !== event.pointerId) return;

    dragState.current.active = false;
    delete element.dataset.dragging;
    if (element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
  };

  const activeIndex = selectedIndex >= 0 ? selectedIndex : currentIndex;

  return (
    <section className="timeline-stage" aria-labelledby="timeline-heading">
      <h2 id="timeline-heading" className="sr-only">
        MCU 电影单条横向时间轴
      </h2>

      <div className="timeline-stage__instruction" aria-hidden="true">
        <Icon name="drag" />
        <span className="timeline-stage__instruction-desktop">
          滚轮、拖拽或方向键横向浏览
        </span>
        <span className="timeline-stage__instruction-mobile">
          左右滑动浏览
        </span>
      </div>

      <button
        type="button"
        className="timeline-stage__nav timeline-stage__nav--previous"
        aria-label="上一时间节点"
        disabled={movies.length === 0 || activeIndex <= 0}
        onClick={() => onNavigate(-1)}
      >
        <Icon name="arrow-left" />
      </button>

      <div
        ref={timelineRef}
        className="timeline-scroll"
        tabIndex={0}
        role="region"
        aria-label={`按${sortMode === "story" ? "剧情" : "上映"}时间从左向右排列的电影时间轴`}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
      >
        <div
          className="timeline-content"
          style={{ "--node-count": movies.length } as React.CSSProperties}
        >
          {movies.length > 0 && (
            <EnergyLine
              pulseTarget={pulseTarget}
              pulseVersion={pulseVersion}
            />
          )}
          {movies.map((movie, index) => (
            <TimelineNode
              key={movie.id}
              movie={movie}
              index={index}
              isSelected={movie.id === selectedId}
              isCurrent={movie.id === currentId}
              position={index % 2 === 0 ? "above" : "below"}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        className="timeline-stage__nav timeline-stage__nav--next"
        aria-label="下一时间节点"
        disabled={
          movies.length === 0 ||
          activeIndex < 0 ||
          activeIndex >= movies.length - 1
        }
        onClick={() => onNavigate(1)}
      >
        <Icon name="arrow-right" />
      </button>
    </section>
  );
}
