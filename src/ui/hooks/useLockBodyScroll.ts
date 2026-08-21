import { useEffect } from 'react';

/** Trava o scroll da página por trás enquanto um overlay/popup está aberto.
 * `overflow: hidden` sozinho não basta em navegadores mobile (o dedo ainda
 * arrasta o conteúdo de trás) — travar a `body` como `position: fixed` no
 * scroll atual é o jeito robusto de garantir isso em iOS/Android. */
export function useLockBodyScroll(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const anterior = {
      position: style.position,
      top: style.top,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.width = '100%';
    style.overflow = 'hidden';

    return () => {
      style.position = anterior.position;
      style.top = anterior.top;
      style.width = anterior.width;
      style.overflow = anterior.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [ativo]);
}
