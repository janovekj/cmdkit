import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { FlagContextProvider } from "./Commands";
import { CommandEventProvider } from "../CommandPalette";

ReactDOM.render(
  <React.StrictMode>
    <FlagContextProvider>
      <CommandEventProvider>
        <App />
      </CommandEventProvider>
    </FlagContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
