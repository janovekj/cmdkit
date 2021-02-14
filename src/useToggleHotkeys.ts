import { useEffect } from "react";

type Config = {
  onClose: VoidFunction;
  onToggle: VoidFunction;
};

export const useToggleHotkeys = ({ onClose, onToggle }: Config): void => {
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
    };

    document.addEventListener("keydown", handleHotkey);

    return () => document.removeEventListener("keydown", handleHotkey);
  }, [onClose, onToggle]);
};
