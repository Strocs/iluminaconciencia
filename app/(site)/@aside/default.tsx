import { LatestArticles } from '../_components/site-aside/LatestArticles'
import { LatestNews } from '../_components/site-aside/LatestNews'

export default function DefaultAside() {
  return (
    <>
      <LatestNews />
      <LatestArticles />
    </>
  )
}
