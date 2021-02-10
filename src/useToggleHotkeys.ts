import { useEffect } from "react";

type Config = {
  onClose: VoidFunction;
  onToggle: VoidFunction;
};

export const useToggleHotkeys = ({ onClose, onToggle }: Config) => {
  useEffect(() => {
    const handleHotkey = (event: KeyboardEvent) => {
      if (event.shiftKey && event.ctrlKey && event.code === "KeyK") {
        onToggle();
      }

      if (event.code === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleHotkey);

    return () => document.removeEventListener("keydown", handleHotkey);
  });
};
