import { Background } from '@/_components/Background'
import { HeaderBoundary } from '@/_shared/header'
import { Hero } from './_sections/hero'
import { MapSection } from './_sections/map/MapSection'
import { NewsArticlesSection } from './_sections/news/NewsArticlesSection'

export default function Home() {
  return (
    <div className="relative isolate h-2000 min-h-dvh font-body">
      <Background />
      <main>
        <Hero />
        <HeaderBoundary />
        <MapSection />
        <NewsArticlesSection />
      </main>
    </div>
  )
}
