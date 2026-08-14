import type { HeroAnimationSnapshot, HeroConsumer } from '../contracts/hero-runtime'

interface CreateScenePresenterOptions {
  root: HTMLElement
}

export function createScenePresenter({ root }: CreateScenePresenterOptions): HeroConsumer {
  const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-hero-scene]'))
  const actions = root.querySelector<HTMLElement>('[data-hero-actions]')
  let activeIndex = -1

  return {
    project: (snapshot: HeroAnimationSnapshot) => {
      const sceneCount = Math.min(scenes.length, snapshot.scenes.length)
      if (sceneCount === 0) {
        scenes.forEach((scene) => {
          scene.style.visibility = 'hidden'
          scene.setAttribute('aria-hidden', 'true')
          scene.toggleAttribute('inert', true)
        })
        actions?.toggleAttribute('hidden', true)
        actions?.toggleAttribute('inert', true)
        actions?.setAttribute('aria-hidden', 'true')
        activeIndex = -1
        return
      }
      const nextActive = snapshot.scenes
        .slice(0, sceneCount)
        .reduce((active, scene, index, states) => (scene.opacity > states[active].opacity ? index : active), 0)
      scenes.forEach((scene, index) => {
        const visual = snapshot.scenes[index]
        if (!visual) {
          scene.style.visibility = 'hidden'
          return
        }
        scene.style.opacity = String(visual.opacity)
        scene.style.transform = `translateY(${visual.y}px)`
        scene.style.visibility = visual.opacity === 0 ? 'hidden' : 'visible'
      })
      if (nextActive === activeIndex && scenes.length === snapshot.scenes.length) return

      activeIndex = nextActive
      scenes.forEach((scene, index) => {
        const active = index === nextActive
        scene.setAttribute('aria-hidden', String(!active))
        scene.toggleAttribute('inert', !active)
      })
      const showActions = nextActive === sceneCount - 1
      actions?.toggleAttribute('hidden', !showActions)
      actions?.toggleAttribute('inert', !showActions)
      actions?.setAttribute('aria-hidden', String(!showActions))
    },
    destroy: () => undefined
  }
}
