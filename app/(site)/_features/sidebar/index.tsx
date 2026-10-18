import { SiteSidebar } from './_components/SiteSidebar'
import { LatestArticles } from './_components/LatestArticles'
import { LatestNews } from './_components/LatestNews'

export function DefaultSidebar() {
  return (
    <SiteSidebar>
      <LatestNews />
      <LatestArticles />
    </SiteSidebar>
  )
}

export function NewsListingSidebar() {
  return (
    <SiteSidebar>
      <LatestArticles />
    </SiteSidebar>
  )
}

export function ArticleListingSidebar() {
  return (
    <SiteSidebar>
      <LatestNews />
    </SiteSidebar>
  )
}
