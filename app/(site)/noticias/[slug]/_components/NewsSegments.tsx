import { cn } from '@/_utils/cn'
import { createNewsLayout } from '../_content/createNewsLayout'
import type { NewsContentTree } from '../_content/types'
import { NewsHtml } from './NewsHtml'
import { NewsMedia, NewsSegmentFrame } from './NewsMedia'

const copyClasses = cn('[&>*+*]:mbs-6', '[&_:where(section,article,div,main,aside,header,footer,nav,hgroup)>*+*]:mbs-6')

const openingSegmentClasses = cn(
  'md:flex md:flex-col md:gap-y-6',
  'md:data-[opening-ready=true]:grid md:data-[opening-ready=true]:grid-rows-[auto] md:data-[opening-ready=true]:gap-y-0',
  'md:data-[opening-ready=true]:*:data-[has-content=true]:row-start-1',
  'md:data-[opening-ready=true]:*:data-[has-content=true]:self-start',
  'md:data-[opening-ready=true]:*:data-[has-content=true]:pbs-(--news-run-offset,0px)',
  'md:data-[opening-ready=true]:*:data-[has-content=true]:pointer-events-none',
  'md:data-[opening-ready=true]:*:data-[news-rail=text]:col-start-1',
  'md:data-[opening-ready=true]:*:data-[news-rail=media]:col-start-2',
  'md:data-[opening-ready=true]:*:data-[news-rail=media]:min-block-(--news-media-height)',
  'md:data-[opening-ready=true]:*:data-[news-rail=media]:top-28',
  'md:data-[opening-ready=true]:[&>*>[data-news-run-content]]:pointer-events-auto',
  'md:data-[opening-ready=true]:data-[opening-fits=true]:*:data-[news-rail=media]:sticky'
)

export function NewsSegments({ content, excludedImageUrl }: { content: NewsContentTree; excludedImageUrl?: string }) {
  return (
    <div className="grid gap-12">
      {createNewsLayout(content.segments, excludedImageUrl).map((segment) => (
        <NewsSegmentFrame
          key={segment.id}
          id={segment.id}
          hasContent={segment.hasOpening || segment.hasBefore || segment.hasMedia || segment.hasAfter}
          hasOpening={segment.hasOpening}
          className={cn(
            'grid min-w-0 gap-6 data-[has-content=false]:hidden *:data-[has-content=false]:hidden',
            'md:grid-cols-2 md:gap-x-12',
            !segment.hasOpening &&
              'md:grid-rows-[min-content_1fr] md:gap-y-0 md:[grid-template-areas:"before_media"_"after_media"]',
            !segment.hasOpening && !segment.hasMedia && 'md:grid-cols-[minmax(0,65ch)_minmax(0,1fr)]',
            !segment.hasBefore && !segment.hasAfter && 'md:grid-cols-[minmax(0,1fr)_minmax(0,65ch)]',
            segment.hasOpening && openingSegmentClasses
          )}
        >
          <div data-news-rail="media" data-has-content={segment.hasOpening} className="min-w-0">
            <div
              data-news-run-content
              className={cn(copyClasses, 'top-28 min-w-0', !segment.hasOpening && 'md:data-[sticky-fits=true]:sticky')}
            >
              <NewsHtml nodes={segment.opening} />
            </div>
          </div>
          <div
            data-news-rail="text"
            data-has-content={segment.hasBefore}
            className={cn('min-w-0 md:self-start', !segment.hasOpening && 'md:[grid-area:before]')}
          >
            <div data-news-run-content className={copyClasses}>
              <NewsHtml nodes={segment.before} />
            </div>
          </div>
          <div
            data-news-rail="media"
            data-has-content={segment.hasMedia}
            className={cn('min-w-0', !segment.hasOpening && 'md:[grid-area:media]')}
          >
            <NewsMedia
              className={cn(copyClasses, 'top-28 min-w-0', !segment.hasOpening && 'md:data-[sticky-fits=true]:sticky')}
            >
              <NewsHtml nodes={segment.media} />
            </NewsMedia>
          </div>
          <div
            data-news-rail="text"
            data-has-content={segment.hasAfter}
            className={cn(
              'min-w-0 md:self-start',
              !segment.hasOpening && 'md:[grid-area:after]',
              !segment.hasOpening && segment.hasBefore && segment.hasAfter && 'md:pbs-6'
            )}
          >
            <div data-news-run-content className={copyClasses}>
              <NewsHtml nodes={segment.after} />
            </div>
          </div>
        </NewsSegmentFrame>
      ))}
    </div>
  )
}
