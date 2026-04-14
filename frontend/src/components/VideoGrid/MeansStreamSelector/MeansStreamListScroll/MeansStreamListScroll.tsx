import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import * as styles from './MeansStreamListScroll.css';

type MeansStreamListScrollProps = {
  children: ReactNode;
};

const MeansStreamListScroll = ({ children }: MeansStreamListScrollProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const updateThumb = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!viewport || !track || !thumb) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    const trackRect = track.getBoundingClientRect();
    const pad = 4;
    const innerH = Math.max(0, trackRect.height - pad * 2);

    if (scrollHeight <= clientHeight || innerH <= 0) {
      thumb.style.opacity = '0';
      thumb.style.height = '0px';
      thumb.style.minHeight = '0';
      thumb.style.top = `${pad}px`;
      return;
    }

    const ratio = clientHeight / scrollHeight;
    let thumbH = Math.max(24, ratio * innerH);
    thumbH = Math.min(thumbH, innerH);
    const maxScroll = scrollHeight - clientHeight;
    const scrollRatio = maxScroll > 0 ? scrollTop / maxScroll : 0;
    const top = pad + scrollRatio * (innerH - thumbH);

    thumb.style.opacity = '1';
    thumb.style.minHeight = '';
    thumb.style.height = `${thumbH}px`;
    thumb.style.top = `${top}px`;
  }, []);

  useLayoutEffect(() => {
    updateThumb();
  }, [updateThumb]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const ro = new ResizeObserver(() => updateThumb());
    ro.observe(viewport);
    const content = viewport.firstElementChild;
    if (content) ro.observe(content);

    viewport.addEventListener('scroll', updateThumb, { passive: true });
    return () => {
      ro.disconnect();
      viewport.removeEventListener('scroll', updateThumb);
    };
  }, [updateThumb]);

  return (
    <div className={styles.root} dir="ltr">
      <div ref={viewportRef} className={styles.viewport} onScroll={updateThumb}>
        <div dir="rtl" className={styles.content}>
          {children}
        </div>
      </div>
      <div ref={trackRef} className={styles.track} aria-hidden>
        <div ref={thumbRef} className={styles.thumb} />
      </div>
    </div>
  );
};

export default MeansStreamListScroll;
