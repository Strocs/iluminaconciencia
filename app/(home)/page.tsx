import { HeaderBehaviorSentinel } from '@/_shared/header'
import { Hero } from './_sections/hero'
import { ContactSection } from './_sections/contact/ContactSection'
import { MapSection } from './_sections/map/MapSection'
import { NewsArticlesSection } from './_sections/news/NewsArticlesSection'

export default function Home() {
  return (
    <main className="space-y-24 md:space-y-42">
      <div>
        <Hero />
        <HeaderBehaviorSentinel />
      </div>
      <MapSection />
      <NewsArticlesSection />
      <ContactSection />
    </main>
  )
}
