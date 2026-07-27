import type { Movie } from "../types/movie";
import { Icon } from "./Icon";

interface DetailDrawerProps {
  movie: Movie | null;
  relatedMovies: Movie[];
  open: boolean;
  onClose: () => void;
  onRelatedSelect: (movie: Movie) => void;
}

export function DetailDrawer({
  movie,
  relatedMovies,
  open,
  onClose,
  onRelatedSelect,
}: DetailDrawerProps) {
  return (
    <>
      <button
        type="button"
        className="drawer-backdrop"
        data-open={open}
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
      />
      <aside
        className="detail-drawer"
        data-open={open}
        aria-hidden={!open}
        aria-label="电影详情"
      >
        {movie && (
          <div className="detail-drawer__content" aria-live="polite">
            <header className="detail-drawer__header">
              <div>
                <span className="detail-drawer__index">
                  <i>{String(movie.storyOrder).padStart(2, "0")}</i>
                </span>
                <h2>{movie.title}</h2>
                <p>{movie.titleZh}</p>
              </div>
              <button
                type="button"
                className="detail-drawer__close"
                aria-label="关闭详情"
                onClick={onClose}
              >
                <Icon name="close" />
              </button>
            </header>

            <figure className="detail-drawer__poster">
              <img
                src={movie.poster}
                alt={`${movie.titleZh}（${movie.title}）大尺寸电影海报原创视觉`}
              />
              <figcaption>{movie.titleZh}</figcaption>
            </figure>

            <dl className="detail-drawer__metadata">
              <div>
                <dt>剧情时间</dt>
                <dd>{movie.storyYear}</dd>
              </div>
              <div>
                <dt>上映时间</dt>
                <dd>
                  <time dateTime={movie.releaseDate}>{movie.releaseDate}</time>
                </dd>
              </div>
              <div>
                <dt>Phase</dt>
                <dd>{movie.phase}</dd>
              </div>
              <div>
                <dt>Saga</dt>
                <dd>{movie.saga}</dd>
              </div>
            </dl>

            <section className="detail-drawer__section">
              <h3>剧情简介</h3>
              <p>{movie.synopsis}</p>
            </section>

            <section className="detail-drawer__section">
              <h3>关键事件</h3>
              <ul className="detail-drawer__events">
                {movie.events.map((event) => (
                  <li key={event}>
                    <span aria-hidden="true" />
                    {event}
                  </li>
                ))}
              </ul>
            </section>

            <section className="detail-drawer__section">
              <h3>主要人物</h3>
              <ul className="detail-drawer__characters">
                {movie.characters.map((character) => (
                  <li key={character}>{character}</li>
                ))}
              </ul>
            </section>

            <section className="detail-drawer__section">
              <h3>前后关联电影</h3>
              <div className="detail-drawer__related">
                {relatedMovies.map((related) => (
                  <button
                    key={related.id}
                    type="button"
                    onClick={() => onRelatedSelect(related)}
                  >
                    <img
                      src={related.poster}
                      alt={`${related.titleZh}电影海报原创视觉`}
                    />
                    <span>
                      <strong>{related.titleZh}</strong>
                      <small>{related.storyYear}</small>
                    </span>
                    <Icon name="arrow-right" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </aside>
    </>
  );
}
