type NavigationItem = {
  label: string
  href: string
  section?: 'explorar' | 'contacto'
}

export const navigationItems = [
  { label: 'Explorar', href: '/', section: 'explorar' },
  { label: 'Noticias', href: '/noticias' },
  { label: 'Artículos', href: '/articulos' },
  { label: 'Multimedia', href: '/multimedia' },
  { label: 'Equipo', href: '/equipo' },
  { label: 'Recursos', href: '/recursos' },
  { label: 'Contacto', href: '/', section: 'contacto' }
] satisfies readonly NavigationItem[]
