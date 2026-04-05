import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PwaUpdater() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.error('SW registration error', error)
    },
  })

  if (needRefresh) {
    return (
      <div className="pwa-toast pwa-toast--update">
        <span>有新内容可用，请刷新更新。</span>
        <button onClick={() => updateServiceWorker(true)}>刷新</button>
      </div>
    )
  }

  return null
}
