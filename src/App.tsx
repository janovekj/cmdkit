import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { CommandPaletteYo as Cmd, Command as Cmmd } from "./CommandPalette";
import { words } from "./words";

type DialogProps = {
  onDone: () => void;
};

type Context =
  | {
      type: "search";
      value: string;
    }
  | {
      type: "dialog";
      view: ({ onDone }: DialogProps) => React.ReactNode;
    };

interface Command {
  id: string;
  // No command = information lookup
  // bare bruke preview feks
  // "Peek state"
  command?: () => void | Context;
  view?: React.ReactNode;
}

function App() {
  const commands: Cmmd[] = useMemo(() => {
    return words.slice(0, 400).map((word) => ({
      id: word,
      name: word,
      command: () =>
        new Promise((res) => {
          setTimeout(() => {
            res(undefined);
            console.log(`execute ${word}`);
          }, 1000);
        }),
      preview: () => (
        <div className="p-4">
          <h3 className="text-xl">Preview</h3>
          <p
            style={{
              color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            }}
          >
            This is a cool preview for {word}{" "}
          </p>
        </div>
      ),
    }));
  }, []);

  return (
    <div>
      <Cmd onSelect={(cmx) => console.log(cmx)} commands={commands}></Cmd>

      <div>
        <header
          className={
            "px-12 py-6 border-b border-gray-300 flex items-center justify-between"
          }
        >
          <h1 className="text-4xl text-blue-900">🚀 Cool App</h1>
          <p className="text-blue-900">
            👤 <span className={"underline"}>User McName</span>
          </p>
        </header>
        <main className="flex flex-col gap-4 p-12">
          <div className="px-4 py-40 bg-blue-100"></div>
          <div className="px-4 py-40 bg-green-100"></div>
        </main>
      </div>
    </div>
  );
}

export default App;
