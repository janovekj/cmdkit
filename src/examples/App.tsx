import React from "react";
import { tw } from "twind";
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
          className={tw`flex items-center justify-between px-12 py-6 border-b border-gray-300`}
        >
          <h1 className={tw`text-4xl text-blue-900`}>🚀 Cool App</h1>
          <p className={tw`text-blue-900`}>
            👤 <span className={tw`underline`}>User McName</span>
          </p>
        </header>
        <main className={tw`flex flex-col gap-4 p-12`}>
          <div className={tw`px-4 py-40 bg-blue-100`}></div>
          <div className={tw`px-4 py-40 bg-green-100`}></div>
        </main>
      </div>
    </div>
  );
}

export default App;
