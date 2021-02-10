import React, { useRef } from "react";

interface Props {
  onClick: VoidFunction;
  children: React.ReactNode;
}

export const Overlay = ({ onClick, children }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      onClick={(event) => {
        if (ref && event.target === ref.current) {
          onClick();
        }
      }}
      style={
        {
          ["--highlight-color"]:
            // "#ff6528"
            "#0054ed",
        } as React.CSSProperties
      }
      className="absolute top-0 left-0 flex justify-center w-full h-full gap-5 p-8 "
    >
      {children}
    </div>
  );
};
