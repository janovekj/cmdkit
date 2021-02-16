import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { FlagContextProvider } from "./Commands";
import { CommandEventProvider } from "../CommandPalette";
import { AppStateProvider } from "./AppState";

ReactDOM.render(
  <React.StrictMode>
    <FlagContextProvider>
      <AppStateProvider>
        <CommandEventProvider>
          <App />
        </CommandEventProvider>
      </AppStateProvider>
    </FlagContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
