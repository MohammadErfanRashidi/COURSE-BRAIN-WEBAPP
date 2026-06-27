/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

interface UseClickOutsideOptions {
  /** Whether the menu/popup is currently open */
  isOpen: boolean;
  /** Callback when a click outside or Escape is detected */
  onClose: () => void;
  /** Ref to a single menu container element */
  menuRef?: React.RefObject<HTMLElement | null>;
  /** CSS selector for identifying menu containers (used when managing multiple menus) */
  containerSelector?: string;
}

/**
 * A reusable hook for dismissing pop-up menus by clicking outside or pressing Escape.
 *
 * Supports two modes:
 * 1. **Ref-based** — pass a `menuRef` to a single container.
 * 2. **Selector-based** — pass a `containerSelector` string like `[data-overflow-menu]`.
 *
 * In both modes the hook:
 * - Listens for `mousedown` / `touchstart` on the document
 * - Checks whether the event target is inside the menu container(s)
 * - Calls `onClose` when the target is outside
 * - Also closes on `Escape` key press
 * - Properly cleans up listeners when `isOpen` becomes false or the component unmounts
 */
export function useClickOutside({
  isOpen,
  onClose,
  menuRef,
  containerSelector,
}: UseClickOutsideOptions) {
  // Store the latest onClose callback in a ref to avoid effect re-runs
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleInteraction = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      let isInside = false;

      if (menuRef?.current) {
        // Single-ref mode
        isInside = menuRef.current.contains(target);
      } else if (containerSelector) {
        // Selector-based mode – check all matching containers
        const containers = document.querySelectorAll(containerSelector);
        for (const container of containers) {
          if (container.contains(target)) {
            isInside = true;
            break;
          }
        }
      }

      if (!isInside) {
        onCloseRef.current();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    };

    document.addEventListener('mousedown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, menuRef, containerSelector]);
}
