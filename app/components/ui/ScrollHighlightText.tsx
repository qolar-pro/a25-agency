import { Fragment } from 'react';

/**
 * Body copy that lights up word-by-word as it scrolls through the viewport.
 *
 * This component only produces the markup — one span per word, tagged with
 * `[data-highlight]` on the block. The animation itself is owned by the shared
 * Reveal system (app/components/motion/Reveal.tsx), which drives it with a
 * ScrollTrigger scrub.
 *
 * That split replaced two earlier hand-rolled versions: the first re-rendered
 * every word through React state on each scroll frame, the second wrote a CSS
 * variable per frame. Both sampled the scroll position discretely, so the
 * sweep stepped rather than glided. A scrub ties word brightness directly to
 * scroll offset and interpolates between samples, which is what actually makes
 * it smooth — and it puts this effect on the same system as every other
 * animation on the page rather than off on its own.
 *
 * No 'use client' needed: there are no hooks or handlers left here, so this
 * renders on the server and ships no JS of its own.
 */
export default function ScrollHighlightText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  // Preserve the paragraph breaks the translations rely on (heroDesc is
  // authored with blank lines between paragraphs), then split each into words.
  const lines = text.split('\n').map((line) => line.split(/\s+/).filter(Boolean));

  return (
    <p data-highlight className={`scroll-hl ${className}`}>
      {lines.map((words, li) => (
        <Fragment key={li}>
          {words.map((word, wi) => (
            <Fragment key={wi}>
              <span className="scroll-hl-word">{word}</span>
              {/* The space is a sibling of the word span, never a child. A
                  trailing space inside the span is trimmed the moment that span
                  becomes a block-ish box, which silently runs every word
                  together — keeping it in the parent's inline flow is immune to
                  whatever `display` the word ends up with. */}
              {wi < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
          {li < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </p>
  );
}
