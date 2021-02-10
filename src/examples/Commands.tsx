import {
  Command,
  useBlurEvent,
  useExecuteEvent,
  useFocusEvent,
  useDoneEvent,
} from "../CommandPalette";
import React, { useContext, useRef, useState } from "react";

export const useRunBigTask = (): Command => {
  const id = "runBigTask";
  const [state, setState] = useState<"initial" | "executing" | "done">(
    "initial"
  );

  useExecuteEvent(id, () => setState("executing"));
  useDoneEvent(id, () => setState("done"));

  return {
    id,
    name: "Run a big task",
    command: () =>
      new Promise((res) => {
        setTimeout(() => {
          res();
        }, 500);
      }),
    view: ({
      initial: <p>This will run a big command</p>,
      executing: <p>Running that big task!</p>,
      done: <p>Done running that big task</p>,
    } as const)[state],
  };
};

export const simpleTask = (name: string): Command => ({
  id: `simpleTask${name}`,
  name: `Simple task ${name}`,
  command: () => console.log(`Logging this name: ${name}`),
  view: <p>Will log {name}</p>,
});

export const oneTaskOutOfMany: Command = {
  id: "oneTaskOutOfMany",
  name: "One task out of many",
  command: () => {
    console.log("Doing all kinds of stuff");
  },
  view: <p>This task will only reset the search</p>,
};

export const useAsyncView = (): Command => {
  const id = "asyncView";
  const [hasFetched, setHasFetched] = useState(false);

  useFocusEvent(id, () => {
    setTimeout(() => {
      setHasFetched(true);
    }, 800);
  });

  useBlurEvent(id, () => {
    setHasFetched(false);
  });

  return {
    id,
    name: "Async view",
    command: () => console.log("helloe"),
    view: (
      <div>{hasFetched ? <p>Wow, that was coool</p> : <p>Loading...</p>}</div>
    ),
  };
};

type FlagContext = {
  flag: boolean;
  setFlag: (flag: boolean) => void;
};

export const FlagContext = React.createContext<FlagContext>({
  flag: false,
  setFlag: () => {},
});

export const useFlagContext = () => useContext(FlagContext);

export const FlagContextProvider: React.FC = ({ children }) => {
  const [flag, setFlag] = useState(false);

  return (
    <FlagContext.Provider
      value={{
        flag,
        setFlag,
      }}
    >
      {children}
    </FlagContext.Provider>
  );
};

export const useToggleFlagTask = (): Command => {
  const { flag, setFlag } = useFlagContext();
  const [count, setCount] = useState(0);

  return {
    id: "toggleFlagTask",
    name: "Toggle that flag",
    command: () => {
      setCount((prev) => prev + 1);
      setFlag(!flag);
    },
    view: (
      <div>
        Change flag from{" "}
        <span className={flag ? "text-green-700" : "text-red-600"}>
          {flag.toString()}
        </span>{" "}
        to{" "}
        <span className={flag ? "text-red-600" : "text-green-700"}>
          {(!flag).toString()}
        </span>
        <p>Have toggled {count} times</p>
      </div>
    ),
  };
};

export const useDeleteUserTask = (): Command => {
  const [id, setId] = useState("");

  const ref = useRef<HTMLInputElement | null>(null);

  return {
    id: "deleteUserTask",
    name: "Delete user",
    view: (
      <div>
        <input
          key="eh"
          type="text"
          ref={ref}
          placeholder="eeeh"
          value={id}
          onChange={(event) => setId(event.target.value)}
        />
      </div>
    ),
  };
};

export const useAwareTask = (): Command => {
  const id = "awareTask";
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useFocusEvent(id, () => {
    console.log("exec onfocus");

    setIsFocused(true);
  });
  useBlurEvent(id, () => setIsFocused(false));
  useExecuteEvent(id, () => setValue(""));

  return {
    id,
    name: `Aware task ${isFocused}`,
    command: () => {},
    view: (
      <div>
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="sdasdas"
        />
      </div>
    ),
  };
};
