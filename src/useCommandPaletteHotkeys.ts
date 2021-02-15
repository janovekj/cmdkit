import { useEffect } from "react";

type Config = {
  onClose: VoidFunction;
  onToggle: VoidFunction;
  onSelect: VoidFunction;
};

export const useCommandPaletteHotkeys = ({
  onClose,
  onToggle,
  onSelect,
}: Config): void => {
  useEffect(() => {
    const handleHotkey = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const isPressingModifier = isMac ? event.metaKey : event.altKey;
      if (isPressingModifier && event.code === "KeyK") {
        event.preventDefault();
        onToggle();
      }

      if (event.code === "Escape") {
        onClose();
      }

      if (event.code === "Enter" && event.shiftKey) {
        onSelect();
      }
    };

    document.addEventListener("keydown", handleHotkey);

    return () => document.removeEventListener("keydown", handleHotkey);
  }, [onClose, onToggle, onSelect]);
};
