# News content tree

`parseNewsContent(sourceHtml, baseUrl)` returns a safe source tree (`nodes`) and reading associations (`segments`). It does not choose columns, sticky positioning, or resource heights.

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

`NewsHtml` renders the sanitized nodes without retagging or regrouping them. The existing primary-image suppression is a rendering-only option; the parser retains every source image. Existing external-link behavior and image dimension fallbacks also remain rendering policies, not invented parser attributes. This delivery deliberately leaves the current column layout unchanged. Segment-based columns and sticky behavior are a subsequent presentation change.
