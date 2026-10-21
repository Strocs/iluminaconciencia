import { cn } from '@/_utils/cn'
import { createNewsLayout } from '../_content/createNewsLayout'
import type { NewsContentTree } from '../_content/types'
import { NewsHtml } from './NewsHtml'
import { NewsMedia, NewsSegmentFrame } from './NewsMedia'
import styles from './news-segments.module.css'

export function NewsSegments({ content, excludedImageUrl }: { content: NewsContentTree; excludedImageUrl?: string }) {
  return (
    <div className={styles.segments}>
      {createNewsLayout(content.segments, excludedImageUrl).map((segment) => (
        <NewsSegmentFrame
          key={segment.id}
          id={segment.id}
          hasContent={segment.hasOpening || segment.hasBefore || segment.hasMedia || segment.hasAfter}
          hasOpening={segment.hasOpening}
          className={styles.segment}
        >
          <div data-news-rail="media" data-has-content={segment.hasOpening} className={styles.opening}>
            <div data-news-run-content className={cn(styles.copy, styles.mediaContent)}>
              <NewsHtml nodes={segment.opening} />
            </div>
          </div>
          <div data-news-rail="text" data-has-content={segment.hasBefore} className={styles.before}>
            <div data-news-run-content className={styles.copy}>
              <NewsHtml nodes={segment.before} />
            </div>
          </div>
          <div data-news-rail="media" data-has-content={segment.hasMedia} className={styles.mediaRail}>
            <NewsMedia className={cn(styles.copy, styles.mediaContent)}>
              <NewsHtml nodes={segment.media} />
            </NewsMedia>
          </div>
          <div data-news-rail="text" data-has-content={segment.hasAfter} className={styles.after}>
            <div data-news-run-content className={styles.copy}>
              <NewsHtml nodes={segment.after} />
            </div>
          </div>
        </NewsSegmentFrame>
      ))}
    </div>
  )
}
