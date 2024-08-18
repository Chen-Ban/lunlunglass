import { RefObject, useEffect } from 'react'

type Props<T> = {
  element: RefObject<T>
  callback: (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void
  options?: IntersectionObserverInit
}
export default function useIntersectionOb<T extends HTMLElement>({ element, callback, options }: Props<T>) {
  useEffect(() => {
    if (!element.current) {
      return
    }
    const ob: IntersectionObserver = new IntersectionObserver(callback, options)
    ob.observe(element.current)
    return () => {
      ob && ob.disconnect()
    }
  }, [callback, options])
}
