import type { Metadata } from 'next'
import { HomePage } from '../_components/HomePage'

export const metadata: Metadata = {
  alternates: { canonical: '/' }
}

export default function ExplorarPage() {
  return <HomePage />
}
