import { StandardLayout } from '@/_features/site-layout/StandardLayout'

export default function NotFound() {
  return (
    <StandardLayout>
      <title>404: This page could not be found.</title>
      <main className="flex min-h-[60dvh] items-center justify-center px-4 py-32 text-foreground sm:px-5">
        <div className="flex items-center">
          <h1 className="mr-5 border-r border-border pr-6 text-2xl font-semibold">404</h1>
          <h2 className="text-sm font-normal">This page could not be found.</h2>
        </div>
      </main>
    </StandardLayout>
  )
}
