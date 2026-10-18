import { SiteAside } from './_components/SiteAside'
import { LatestArticles } from './_components/LatestArticles'
import { LatestNews } from './_components/LatestNews'

export function DefaultSidebar() {
  return (
    <SiteAside>
      <LatestNews />
      <LatestArticles />
    </SiteAside>
  )
}

export function NewsListingSidebar() {
  return (
    <SiteAside>
      <LatestArticles />
    </SiteAside>
  )
}

export function ArticleListingSidebar() {
  return (
    <SiteAside>
      <LatestNews />
    </SiteAside>
  )
}
