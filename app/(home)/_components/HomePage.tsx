import { HeaderBehaviorSentinel } from '@/_shared/header'
import { HomeSectionNavigation } from '@/_shared/home-navigation/HomeSectionNavigation'
import { ContactSection } from '../_sections/contact/ContactSection'
import { Hero } from '../_sections/hero'
import { MapSection } from '../_sections/map/MapSection'
import { NewsArticlesSection } from '../_sections/news/NewsArticlesSection'
import { Separator } from '@/_components/Separator'

export function HomePage() {
  return (
    <HomeSectionNavigation>
      <div className="space-y-12 md:space-y-24">
        <div>
          <Hero />
          <HeaderBehaviorSentinel />
        </div>
        <Separator />
        {/* Mapa / Exploración */}
        <MapSection />
        <Separator />
        {/* Noticias y Publicaciones */}
        <NewsArticlesSection />
        <Separator />
        <ContactSection />
        <Separator />
      </div>
    </HomeSectionNavigation>
  )
}
