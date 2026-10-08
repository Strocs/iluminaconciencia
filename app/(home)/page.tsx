import { Background } from '@/_components/Background'
import { HeaderBehaviorSentinel } from '@/_shared/header'
import { Hero } from './_sections/hero'
import { MapSection } from './_sections/map/MapSection'
import { NewsArticlesSection } from './_sections/news/NewsArticlesSection'

export default function Home() {
  return (
    <div className="relative isolate min-h-dvh font-body">
      <Background />
      <main className="space-y-24 md:space-y-42">
        <div>
          <Hero />
          <HeaderBehaviorSentinel />
        </div>
        <MapSection />
        <NewsArticlesSection />
      </main>
    </div>
  )
}
