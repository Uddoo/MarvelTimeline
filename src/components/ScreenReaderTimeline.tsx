import type { Movie } from "../types/movie";

export function ScreenReaderTimeline({ movies }: { movies: Movie[] }) {
  return (
    <section className="sr-only" aria-label="时间轴文本备用列表">
      <h2>MCU 电影时间顺序文本列表</h2>
      <ol>
        {movies.map((movie) => (
          <li key={movie.id}>
            {movie.titleZh}，英文名 {movie.title}，剧情时间 {movie.storyYear}，
            上映年份 {movie.releaseYear}，{movie.phase}，{movie.saga}。
          </li>
        ))}
      </ol>
    </section>
  );
}
