# News and publication snapshots

These files contain public content captured on 2026-10-16 for the future news and article DAL. They are data only: this extraction does not introduce query functions, caching, page rendering or pagination.

| Snapshot                               | Source                                                                             | Records |
| -------------------------------------- | ---------------------------------------------------------------------------------- | ------- |
| `news/data/news.snapshot.json`         | <https://iluminaconciencia.userena.digital/news_list> and every linked news detail | 31      |
| `articles/data/articles.snapshot.json` | The `#articles` section of <https://iluminaconciencia.userena.digital/>            | 7       |

## Extraction

The public pages were retrieved as raw HTML, without browser automation or authenticated access. News metadata was taken from the index and checked against each detail page. Full titles came from `.single_title`, dates from `.m_item`, and body content from `.single_desc`. Publication metadata came from the homepage's `#articles .blog__item` elements; readable-page extraction omits this section.

All 31 linked news details were captured successfully. No unlinked numeric IDs were guessed. The original ordering is retained in `sourcePosition`, rather than silently sorting publications or removing repeated titles. Whitespace is normalized in extracted text; archived body HTML is preserved separately.

Each snapshot records its capture time, source URL and SHA-256 of the captured UTF-8 source HTML. News also record the hash of each detail page. Resource URLs are made absolute against their source page. Images, videos and publication documents remain references to the original resources; their binary files were not downloaded and third-party resource availability is not guaranteed by this capture.

## News fields

- `id`: original numeric route identifier, stored as a string.
- `slug`: explicit ASCII slug derived once from the complete title. Both members of a colliding pair have their original ID appended. Do not regenerate slugs from titles at render time.
- `title`: complete detail-page title. `sourceListingTitle` preserves the original, sometimes truncated index title.
- `description`: original index excerpt, not an invented summary. `descriptionIsTruncated` records a trailing ellipsis; complete available text is in `content.text`.
- `publishedAt`: source-local timestamp without a timezone suffix. `publishedAtLabel` preserves the displayed date and `datePrecision` is `minute`.
- `image`: index thumbnail URL and original alternative text, or `null` alternative text when the source has none.
- `sourceUrl`, `sourcePosition`, `sourcePageSha256`: provenance.
- `content.text`: extracted detail text, retaining block boundaries and excluding script/style content.
- `content.sourceHtml`: original body fragment retained as archival evidence.
- `content.images`, `content.links`, `content.embeds`: original content resource references. Embed URLs retain their query parameters, including video start times.

**`sourceHtml` is untrusted source evidence, not sanitized HTML and not a selected future backend format. Do not feed it directly to `dangerouslySetInnerHTML`.** The eventual page composition must use explicitly handled content; the Markdown-versus-HTML API decision remains open.

### Source peculiarities

- The index truncates 16 titles; the snapshot restores them from their detail pages.
- IDs `22` and `33` share a title, as do IDs `29` and `32`. All four remain separate records with distinct slugs and original dates/content.
- IDs `31` and `35` contain only YouTube embeds in their detail body. Their `content.text` is intentionally empty; their index descriptions are still available.
- There are five embedded frames and 40 inline image references across the news bodies, in addition to the 31 index thumbnails.
- Source timestamps have no stated timezone. Do not append `Z` or invent a UTC offset.
- Source text, spelling, inconsistent dates and original outbound links are preserved rather than editorially corrected.

## Publication fields

- `id`: synthetic `article-<hash>` identifier using the first 12 SHA-256 hex characters of the absolute resource URL. The homepage provides no publication IDs; these identifiers do not depend on list position.
- `title`: the homepage publication title.
- `publishedAt`: `YYYY-MM` or `YYYY`, according to `datePrecision` (`month` or `year`). No publication day is invented.
- `publishedAtLabel`: original displayed date.
- `resourceUrl`: direct external page or PDF URL. Future UI links should say **Ver publicación**, open in a new tab and omit the `download` attribute.
- `image`: original image reference when present; otherwise `null`.
- `sourceUrl`, `sourcePosition`: provenance.

The homepage provides one publication image and no publication descriptions, abstracts or categories. Those missing fields are not fabricated. The first bulletin is dated **Junio, 2023** in the source, not the October date used by the old home mock.

## Verification and boundaries

Source comparison verified all 31/31 news IDs in original order, full titles, date labels and local timestamps, exact body fragments and SHA-256 hashes, original excerpts and truncation flags, thumbnails, and iframe/image/link references. It also verified all 7/7 publication titles, source dates, resource URLs and URL-derived synthetic IDs. Structural checks confirmed unique IDs/slugs, source precision, duplicate-title pairs `22`/`33` and `29`/`32`, media-only records `31`/`35`, and the bulletin date `Junio, 2023`.

The snapshots contain 31 news records, 7 publications, 5 news iframes, 40 inline news-body images, 31 news thumbnails and 1 publication image. Sixteen news titles truncated in the index are restored in full. The homepage has one publication image; other publications have no image.

No tests were added, per repository policy. No Playwright or visual verification was performed. The existing home mock is not migrated in this extraction-only unit; connecting `getNews`, `getNewsBySlug` and `getArticles` is the next implementation unit.
