import React, { useRef } from "react";
import { tw } from "twind";

export const Overlay: React.FC<{ onClick: VoidFunction }> = ({
  onClick,
  children,
}) => {
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
            //  "#ff6528",
            // "#0054ed",
            "#ff5f20",
        } as React.CSSProperties
      }
      className={tw`absolute top-0 left-0 flex justify-center w-full h-full gap-5 p-8`}
    >
      {children}
    </div>
  );
};
