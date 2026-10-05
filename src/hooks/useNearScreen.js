import { useState, useRef, useEffect } from 'react';

export default function useNearScreen({ distance = '100px', externalRef, once = true } = {}) {
  const [isNearScreen, setNearScreen] = useState(false);
  const elementRef = useRef();
  const finalRef = externalRef ? externalRef.current : elementRef.current;

  useEffect(() => {
    let observer;

    const onChange = (entries, obs) => {
      const el = entries[0];
      if (el.isIntersecting) {
        setNearScreen(true);
        if (once) obs.disconnect();
      } else {
        if (!once) setNearScreen(false);
      }
    };

    Promise.resolve(
      typeof IntersectionObserver !== 'undefined'
        ? IntersectionObserver
        : import('intersection-observer')
    ).then(() => {
      observer = new IntersectionObserver(onChange, { rootMargin: distance });
      if (finalRef) {
        observer.observe(finalRef);
      }
    });

    return () => observer && observer.disconnect();
  }, [distance, externalRef, once, finalRef]);

  return { isNearScreen, elementRef };
}
