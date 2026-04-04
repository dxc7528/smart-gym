import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PwaUpdater() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.error('SW registration error', error)
    },
  })

  if (offlineReady) {
    setTimeout(() => setOfflineReady(false), 3000)
    return (
      <div className="pwa-toast pwa-toast--ready">
        <span>已准备好离线使用</span>
      </div>
    )
  }

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
