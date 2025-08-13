import { useEffect, useRef, type PointerEvent } from "react";

export function useOutisdeClick<T extends HTMLElement>(fn: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const onClick = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target)){
        fn();
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [ref]);

  return ref;
}