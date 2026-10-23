# News content tree

`parseNewsContent(sourceHtml, baseUrl)` returns a safe source tree (`nodes`) and reading associations (`segments`). It does not choose columns, sticky positioning, or resource heights.

The detail consumer supplies only `News.body`, mapped from the API's `cuerpo`, as HTML input. The configured API origin is the URL resolution base; there is no per-record source-page URL or snapshot content metadata. Parsing and sanitization rules remain unchanged.

## Pipeline

1. Parse HTML with the existing `htmlparser2` dependency.
2. Sanitize elements and attributes, retaining permitted tag names and nesting.
3. Trim only the two outer document edges.
4. Identify media/text runs without changing the source tree.

The tree preserves `h1` through `h6`, `b`, `i`, explicit containers, internal empty paragraphs, line breaks, and inline spaces. `pre`/`code` whitespace is not trimmed. Malformed HTML follows the parser's normal HTML repair behavior; the contract is tree fidelity, not byte-for-byte serialization.

Sanitization uses explicit element/attribute allowlists. Executable, foreign, form, and document-control elements are discarded with their content. Unsupported tags are unwrapped without converting them into another tag. Inline styles, classes, event handlers, `srcdoc`, and unvalidated `srcset` are not forwarded. URL rules reuse `newsContentUrls.ts`; embeds remain restricted to HTTPS `www.youtube.com/embed/`. Invalid media resources are discarded; an invalid link retains its `a` element without an `href`.

## Segments

Each segment contains:

- `content`: narrative blocks, including headings, lists, quotes, and mixed text/media paragraphs.
- `media`: standalone images, figures with captions, videos, audio, and permitted embeds.
- `source`: the same blocks in original reading order.

Each block references its original `node` and `ancestors`, so traversing structural wrappers does not lose their identity. Segments are metadata, not invented HTML sections. Render the canonical `nodes` to reproduce the source hierarchy.

A resource closes the text run preceding it:

```text
T1 → T2 → figure1 → T3 → video → T4 → T5 → image2

content: [T1, T2]  media: [figure1]
content: [T3]      media: [video]
content: [T4, T5]  media: [image2]
```

Consecutive resources share a segment, even across whitespace. Opening resources form a media-only segment. Text after the final resource extends the final segment; `source` still records that it originally followed the media. Text-only news has one segment with no media; empty news has none.

Mixed paragraphs and links are indivisible. Figures retain their captions; paragraph text is never guessed to be a caption, and bold text is never inferred to be a heading. Structural wrappers do not imply a new editorial topic.

## Rendering boundary

`NewsHtml` renders sanitized nodes without retagging. Links with an `href` preserve the sanitized source target (`_self` or `_blank`) and default to `_blank` when none is retained, with `rel="noopener noreferrer"`. Primary-image suppression, link-target defaults, and dimension fallbacks remain rendering policies, not invented parser attributes.

`createNewsLayout` projects each segment into `opening`, `before`, `media`, and `after` groups without mutating the canonical tree. Leading media-only segments join the first narrative interval in this presentation projection, not in the parser. Their opening resources appear above that interval's closing resources in the right rail; media-only articles remain unchanged. Ancestor wrappers retain their tags; when split across layout fragments, their HTML IDs appear only on the first fragment. Consecutive resources retain their intervening spacing. Suppressing the primary image removes only its presentation copy, not the parser node or unrelated caption text.

`NewsSegments` renders those four groups in source order: opening resources, narrative, closing resources, and any trailing text. Mobile stacks them in that order; desktop places both text groups in the left rail and the resource group in the right rail. Both occupied rails have equal width. With one rail empty, CSS lets the occupied rail grow up to 65ch while retaining the empty side. No semantic content is generated to fill it.

Media sticks only inside its segment. `NewsMedia` is the narrow client boundary: a callback-ref `ResizeObserver` and window resize listener toggle a fit marker, with cleanup on unmount. If the complete group is taller than the viewport space below the header, it remains in normal flow. No clipping, nested scrolling, autoplay, forced section height, or JavaScript width calculation is used. For opening groups, `NewsSegmentFrame` observes all four source runs and measures only their heights. CSS stacks runs independently in the two rails using those offsets, without moving or duplicating DOM nodes. Media runs share the complete group's height and sticky bounds, so they move together; oversized groups stay in normal flow. Offset wrappers are pointer-transparent while their content remains interactive. Hidden runs are also observed so later content changes are detected, and observers/listeners are cleaned up on unmount. Ordinary groups keep their existing layout/observer path.

Without JavaScript or ResizeObserver, the source remains readable and media stays non-sticky; opening groups fall back to their original vertical sequence.
