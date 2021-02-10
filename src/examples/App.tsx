import React from "react";
import { CommandPalette } from "../CommandPalette";
import {
  useRunBigTask,
  simpleTask,
  oneTaskOutOfMany,
  useAsyncView,
  useToggleFlagTask,
  useDeleteUserTask,
  useAwareTask,
} from "./Commands";

function App() {
  return (
    <div>
      <CommandPalette
        commands={[
          useRunBigTask(),
          ...["jan", "cilje", "bobb", "hello"].map(simpleTask),
          oneTaskOutOfMany,
          useAsyncView(),
          useToggleFlagTask(),
          useDeleteUserTask(),
          useAwareTask(),
          // toggleFlagTask(flagContext),
        ]}
      ></CommandPalette>

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
