import { useEffect } from 'react';

export const useCodelensShortcuts = (container: HTMLDivElement | null) => {
  useEffect(() => {
    const handler = (event: Event) => {
      if (event instanceof KeyboardEvent) {
        if (event.metaKey && event.shiftKey && event.key === 'Enter') {
          const currentRunButton = document.querySelector(
            '.milvus-http-request-highlight .playground-codelens .run-button'
          );
          currentRunButton?.dispatchEvent(new MouseEvent('click'));
          event.preventDefault();
        } else if (event.metaKey && event.key === 'h') {
          const currentDocsButton = document.querySelector(
            '.milvus-http-request-highlight .playground-codelens .docs-button'
          );
          currentDocsButton?.dispatchEvent(new MouseEvent('click'));
          event.preventDefault();
        }
      }
    };

    container?.addEventListener('keydown', handler);

    return () => {
      container?.removeEventListener('keydown', handler);
    };
  }, [container]);
};
