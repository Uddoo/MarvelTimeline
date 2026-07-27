import type { CSSProperties } from "react";
import type { Movie } from "../types/movie";

interface TimelineNodeProps {
  movie: Movie;
  index: number;
  isSelected: boolean;
  isCurrent: boolean;
  position: "above" | "below";
  onSelect: (movie: Movie) => void;
}

export function TimelineNode({
  movie,
  index,
  isSelected,
  isCurrent,
  position,
  onSelect,
}: TimelineNodeProps) {
  return (
    <div
      className={`timeline-slot timeline-slot--${position}`}
      data-timeline-slot
      data-movie-id={movie.id}
      style={{ "--node-index": index } as CSSProperties}
    >
      <button
        type="button"
        className="movie-node"
        aria-current={isSelected ? "true" : undefined}
        aria-describedby={`meta-${movie.id}`}
        data-selected={isSelected}
        data-current={isCurrent}
        onClick={() => onSelect(movie)}
      >
        <span className="movie-node__index" aria-hidden="true">
          <i>{String(index + 1).padStart(2, "0")}</i>
        </span>
        <span className="movie-node__poster">
          <img
            src={movie.poster}
            alt={`${movie.titleZh}（${movie.title}）电影院线版海报`}
            draggable="false"
          />
          <span className="movie-node__poster-sheen" aria-hidden="true" />
        </span>
        <span className="movie-node__body">
          <span className="movie-node__title-en">{movie.title}</span>
          <span className="movie-node__title-zh">{movie.titleZh}</span>
          <span className="movie-node__years" id={`meta-${movie.id}`}>
            <span>剧情 {movie.storyYear}</span>
            <i aria-hidden="true" />
            <span>上映 {movie.releaseYear}</span>
          </span>
          <span className="movie-node__taxonomy">
            {movie.phase}
            <span aria-hidden="true">·</span>
            {movie.saga === "Infinity Saga" ? "无限传奇" : "多元宇宙传奇"}
          </span>
        </span>
      </button>
      <span className="timeline-slot__connector" aria-hidden="true" />
      <span className="timeline-slot__marker" aria-hidden="true">
        <i />
      </span>
    </div>
  );
}
