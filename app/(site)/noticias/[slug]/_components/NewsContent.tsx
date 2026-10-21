import 'server-only'
import Image from 'next/image'
import type { News } from '@/_dal/news/types'
import { cn } from '@/_utils/cn'
import { NewsHtml } from './NewsHtml'
import { getNewsMediaUrl } from '../_utils/newsContentUrls'
import { parseNewsContent } from '../_content/parseNewsContent'

export function NewsContent({ news }: { news: News }) {
  const content = parseNewsContent(news.content.sourceHtml, news.sourceUrl)
  const primaryImageUrl = getNewsMediaUrl(news.image?.url, news.sourceUrl)

  return (
    <div>
      {news.image && primaryImageUrl && (
        <figure className="break-inside-avoid">
          <Image
            src={primaryImageUrl}
            alt={news.image.alt ?? ''}
            width={1200}
            height={675}
            unoptimized
            className="h-auto max-h-100 w-full rounded-lg border border-border object-cover object-top-left"
          />
        </figure>
      )}
      <div
        className={cn([
          'columns-1 gap-12 space-y-6 py-12 font-body text-base leading-relaxed text-foreground sm:text-lg md:columns-2',
          '[&_a]:text-primary [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-accent [&_a:hover]:text-accent',
          '[&_blockquote]:space-y-2 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:text-sm',
          '[&_figcaption]:text-sm [&_figcaption]:text-text',
          '[&_figure]:break-inside-avoid [&_figure]:space-y-2',
          '[&_h1]:break-after-avoid [&_h1]:font-heading [&_h1]:text-2xl [&_h1]:font-semibold',
          '[&_h2]:break-after-avoid [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold',
          '[&_h3]:break-after-avoid [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold',
          '[&_h4]:break-after-avoid [&_h4]:font-heading [&_h4]:font-semibold',
          '[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6',
          '[&_p]:font-extralight [&_p]:text-text',
          '[&_strong]:font-semibold',
          '[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6'
        ])}
      >
        <NewsHtml nodes={content.nodes} excludedImageUrl={primaryImageUrl} />
      </div>
    </div>
  )
}
