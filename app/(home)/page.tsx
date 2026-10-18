import { Separator } from '@/_components/Separator'
import { ContactSection } from './_sections/contact/ContactSection'
import { Hero } from './_sections/hero'
import { MapSection } from './_sections/map/MapSection'
import { NewsArticlesSection } from './_sections/news/NewsArticlesSection'

export default function Home() {
  return (
    <main className="space-y-12 pb-12 md:space-y-24 md:pb-24">
      <Hero />
      <MapSection />
      <Separator />
      <NewsArticlesSection />
      <Separator />
      <ContactSection />
    </main>
  )
}
