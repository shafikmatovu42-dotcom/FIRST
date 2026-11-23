import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type SmartImageProps = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  priority?: boolean;
  rootMargin?: string;
  className?: string;
  wrapperClassName?: string;
  width?: number;
  height?: number;
  sizes?: string;
};

/**
 * Viewport-gated image component:
 * - When `priority` is false (default), does NOT assign `src` or trigger any
 *   network request until the element enters `rootMargin` of the viewport.
 * - Uses native `loading="lazy"` + `decoding="async"` as a second layer.
 * - Guards fallback image swapping against error loops.
 */
export function SmartImage({
  src,
  alt,
  fallbackSrc = "/parts/headlamp.jpg",
  priority = false,
  rootMargin = "150px 0px",
  className,
  wrapperClassName,
  width,
  height,
  sizes,
}: SmartImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(priority);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const normalizedSrc = src?.trim() || fallbackSrc;
  const activeSrc = failed ? fallbackSrc : normalizedSrc;

  // Reset states when source URL changes (e.g. pagination or edit preview)
  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [normalizedSrc]);

  useEffect(() => {
    if (priority) {
      setInView(true);
      return;
    }
    if (inView) return;
    if (typeof window === "undefined") return;

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [priority, inView, rootMargin]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden bg-elevated", wrapperClassName)}
    >
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-muted/60"
        />
      )}
      {inView ? (
        <img
          src={activeSrc}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (!failed && normalizedSrc !== fallbackSrc) {
              setFailed(true);
            } else {
              setLoaded(true);
            }
          }}
          className={cn(
            "transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            className,
          )}
        />
      ) : null}
    </div>
  );
}
