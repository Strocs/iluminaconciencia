import { Background } from '@/_components/Background'
import { HeaderBoundary } from './_components/HeaderBoundary'
import { Hero } from './_sections/hero'

export default function Home() {
  return (
    <div className="relative isolate h-2000 min-h-dvh font-body">
      <Background />
      <main>
        <Hero />
        <HeaderBoundary />
      </main>
    </div>
  )
}
