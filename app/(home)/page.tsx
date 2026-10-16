import { HeaderBehaviorSentinel } from '@/_shared/header'
import { Hero } from './_sections/hero'
import { ContactSection } from './_sections/contact/ContactSection'
import { MapSection } from './_sections/map/MapSection'
import { NewsArticlesSection } from './_sections/news/NewsArticlesSection'
import { Separator } from '@/_components/Separator'

export default function Home() {
  return (
    <main className="space-y-12 md:space-y-24">
      <div>
        <Hero />
        <HeaderBehaviorSentinel />
      </div>
      <Separator />
      <MapSection />
      <Separator />
      <NewsArticlesSection />
      <Separator />
      <ContactSection />
      <Separator />
    </main>
  )
}
