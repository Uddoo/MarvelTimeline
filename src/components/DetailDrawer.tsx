import {
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
} from "react";
import type { Movie } from "../types/movie";
import { Icon } from "./Icon";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

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
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useLayoutEffect(() => {
    const wasOpen = wasOpenRef.current;

    if (open && !wasOpen) {
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        !drawerRef.current?.contains(activeElement)
      ) {
        triggerRef.current = activeElement;
      }
      closeButtonRef.current?.focus({ preventScroll: true });
    } else if (!open && wasOpen) {
      const trigger = triggerRef.current;
      triggerRef.current = null;
      if (trigger?.isConnected) {
        trigger.focus({ preventScroll: true });
      }
    }

    wasOpenRef.current = open;
  }, [open]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusableElements = Array.from(
      drawer.querySelectorAll<HTMLElement>(focusableSelector),
    ).filter((element) => element.getClientRects().length > 0);

    if (focusableElements.length === 0) {
      event.preventDefault();
      drawer.focus({ preventScroll: true });
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (
      event.shiftKey &&
      (activeElement === firstElement || !drawer.contains(activeElement))
    ) {
      event.preventDefault();
      lastElement.focus();
    } else if (
      !event.shiftKey &&
      (activeElement === lastElement || !drawer.contains(activeElement))
    ) {
      event.preventDefault();
      firstElement.focus();
    }
  };

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
        ref={drawerRef}
        className="detail-drawer"
        data-open={open}
        role="dialog"
        aria-modal={open ? "true" : undefined}
        aria-hidden={!open}
        aria-label="电影详情"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
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
                ref={closeButtonRef}
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
                alt={`${movie.titleZh}（${movie.title}）大尺寸电影院线版海报`}
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
                      alt={`${related.titleZh}电影院线版海报`}
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
