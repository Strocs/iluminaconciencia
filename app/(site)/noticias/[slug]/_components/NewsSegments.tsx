import { cn } from '@/_utils/cn'
import { createNewsLayout } from '../_content/createNewsLayout'
import type { NewsContentTree } from '../_content/types'
import { NewsHtml } from './NewsHtml'
import { NewsMedia } from './NewsMedia'
import styles from './news-segments.module.css'

export function NewsSegments({ content, excludedImageUrl }: { content: NewsContentTree; excludedImageUrl?: string }) {
  return (
    <div className={styles.segments}>
      {createNewsLayout(content.segments, excludedImageUrl).map((segment) => (
        <div
          key={segment.id}
          data-news-segment={segment.id}
          data-has-content={segment.hasBefore || segment.hasMedia || segment.hasAfter}
          className={styles.segment}
        >
          <div data-has-content={segment.hasBefore} className={cn(styles.copy, styles.before)}>
            <NewsHtml nodes={segment.before} />
          </div>
          <div data-has-content={segment.hasMedia} className={styles.mediaRail}>
            <NewsMedia className={cn(styles.copy, styles.mediaContent)}>
              <NewsHtml nodes={segment.media} />
            </NewsMedia>
          </div>
          <div data-has-content={segment.hasAfter} className={cn(styles.copy, styles.after)}>
            <NewsHtml nodes={segment.after} />
          </div>
        </div>
      ))}
    </div>
  )
}
