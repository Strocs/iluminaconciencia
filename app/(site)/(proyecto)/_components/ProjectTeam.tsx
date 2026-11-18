import Image from 'next/image'
import marcelo from '../_assets/marcelo_jaque.jpg'
import abel from '../_assets/abel_aracena.jpg'
import emilio from '../_assets/emilio_castro.jpg'
import karina from '../_assets/karina_nunez.jpg'
import felipe from '../_assets/felipe_ramos.jpg'
import sergio from '../_assets/sergio.jpg'
import fabian from '../_assets/fabian_vasquez.jpg'
import daniel from '../_assets/daniel.jpg'
import guillermo from '../_assets/guillermo_damke.jpg'
import rodolfo from '../_assets/rodolfo_angeloni.jpg'
import juanPablo from '../_assets/juan_pablo.jpg'

const team = [
  { name: 'Marcelo Jaque', role: 'Astrónomo · Dirección del proyecto', photo: marcelo },
  { name: 'Abel Aracena', role: 'Ingeniero en Computación · Almacenamiento y visualización de datos', photo: abel },
  { name: 'Emilio Castro', role: 'Periodista · Comunicaciones y realización audiovisual', photo: emilio },
  { name: 'Karina Nuñez', role: 'Ingeniera Comercial · Operación y gestión', photo: karina },
  { name: 'Felipe Ramos', role: 'Astrónomo · Astronomía del proyecto', photo: felipe },
  { name: 'Sergio Muñoz', role: 'Periodista · Vinculación con el territorio', photo: sergio },
  { name: 'Fabián Vásquez', role: 'Diseñador · Diseño de interfaces', photo: fabian },
  { name: 'Daniel Ortiz', role: 'Ingeniero en Computación · Gestión de fotómetros y desarrollo', photo: daniel },
  { name: 'Guillermo Damke', role: 'Astrónomo, NOIRLab · Colaboración', photo: guillermo },
  { name: 'Rodolfo Angeloni', role: 'Astrónomo, NOIRLab · Colaboración', photo: rodolfo },
  { name: 'Juan Pablo Uchima', role: 'Ingeniero Físico · Colaboración', photo: juanPablo }
]

export function ProjectTeam() {
  return (
    <ul className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {team.map(({ name, role, photo }) => (
        <li key={name} className="flex min-w-0 flex-col">
          <Image
            src={photo}
            alt=""
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 25vw, 240px"
            className="aspect-square w-full rounded-sm border border-border object-cover"
          />
          <div className="flex flex-1 flex-col gap-2 pt-2">
            <h3 className="font-heading text-xl leading-tight text-foreground">{name}</h3>
            <div className="space-y-1 text-sm leading-snug">
              <p className="text-primary">{role.split(' · ')[0]}</p>
              <p className="text-text">{role.split(' · ')[1]}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
