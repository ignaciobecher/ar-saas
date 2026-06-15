import { useEffect, useState } from 'react'
import { getUnreadCount } from '@/lib/api/notifications'

export function useUnreadNotifications(intervalMs = 30000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let mounted = true

    const fetch = async () => {
      try {
        const res = await getUnreadCount()
        if (mounted) setCount(res.count)
      } catch { /* silent */ }
    }

    fetch()
    const timer = setInterval(fetch, intervalMs)
    return () => { mounted = false; clearInterval(timer) }
  }, [intervalMs])

  return count
}
