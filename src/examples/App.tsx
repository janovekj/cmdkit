import React, { useEffect, useState } from "react";
import { tw } from "twind";
import {
  CommandPalette,
  useFocusEvent,
  useAppearEvent,
} from "../CommandPalette";
import { useAppState } from "./AppState";
import { fetchUser, Login } from "./Login";
import { words } from "./words";

const user = {
  age: 27,
  eyeColor: "blue",
  name: "Whitney Hicks",
  gender: "male",
  company: "EYEWAX",
  email: "whitneyhicks@eyewax.com",
};

const setInputValue = (input: HTMLInputElement, value: string) => {
  const lastValue = input.value;
  input.value = value;
  const event = new Event("input", { bubbles: true });
  const tracker = input._valueTracker;
  if (tracker) {
    tracker.setValue(lastValue);
  }
  input.dispatchEvent(event);

  const check = () =>
    new Promise<void>((res) => {
      setTimeout(() => {
        if (input.value === value) {
          res();
        } else {
          check().then(res);
        }
      }, 10);
    });

  return check();
};

const loginAsJan = {
  id: "loginAsJan",
  name: "Log in as Jan",
  command: () => {
    const nameInput = document.getElementById("username") as HTMLInputElement;
    setInputValue(nameInput, "jan")
      .then(() => {
        const passwordInput = document.getElementById(
          "password"
        ) as HTMLInputElement;
        setInputValue(passwordInput, "hunter2");
      })
      .then(() => {
        document
          .getElementById("submit")
          .dispatchEvent(new Event("click", { bubbles: true }));
      });
  },
};

const fetchThoseData = (): Promise<typeof user> =>
  new Promise((res) =>
    setTimeout(() => {
      res(user);
    }, 1000)
  );

const clearSessionStorage = {
  id: "clear",
  name: "Clear session storage",
  command: () => sessionStorage.removeItem("user"),
};

const createSetUserCommand = (
  current: string,
  onChange: (id: string) => void
) => ({
  id: "setUser",
  name: "Set user",
  view: (
    <label className={tw`flex flex-col gap-2 p-4 font-semibold`} htmlFor="">
      Id + [Enter]
      <input
        className={tw`px-4 py-2 text-black border border-gray-500 rounded-md`}
        type="text"
        defaultValue={current}
        onKeyDown={(event) =>
          event.key === "Enter" &&
          fetchUser((event.target as HTMLInputElement).value).then(onChange)
        }
      />
    </label>
  ),
});

const useCheckStateCommand = () => {
  const { count } = useAppState();

  return {
    id: "checkState",
    name: "Check state",
    view: <p>The current count is {count}</p>,
  };
};

const useCheckAsyncData = () => {
  const [data, setData] = useState<typeof user>(undefined);
  const id = "checkAsyncData";

  useFocusEvent(id, () => {
    fetchThoseData().then(setData);
  });

  return {
    id,
    name: "Check some async data",
    view: (
      <div>
        {data ? (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <p>Waiting for data!!!</p>
        )}
      </div>
    ),
  };
};

const useLoadWhenRelevantTask = () => {
  const id = "loadWhenRelevant";

  useAppearEvent(id, () => {
    console.log("appeared!");
  });

  return {
    id,
    name: "when relevant",
  };
};

function App() {
  const [user, _setUser] = useState(sessionStorage.getItem("user") ?? "");
  const setUser = (id: string) => {
    _setUser(id);
    sessionStorage.setItem("user", id);
  };

  const [view, setView] = useState<"login" | "dashboard">(
    user ? "dashboard" : "login"
  );

  const { increment } = useAppState();
  return (
    <div>
      <CommandPalette
        commands={[
          loginAsJan,
          // ...words.map((command) => ({
          //   id: `command${command.replace(/\s*/g, "")}`,
          //   name: command,
          // })),
          clearSessionStorage,
          createSetUserCommand(user, setUser),
          useCheckStateCommand(),
          useCheckAsyncData(),
          useLoadWhenRelevantTask(),
        ]}
      ></CommandPalette>

      <div>
        <header
          className={tw`flex items-center justify-between px-12 py-6 border-b border-gray-300`}
        >
          <h1 className={tw`text-4xl text-blue-900`}>🚀 Cool App</h1>
          {user && (
            <p className={tw`text-blue-900`}>
              👤 <span className={tw`underline`}>{user}</span>
            </p>
          )}
        </header>

        {view === "login" && (
          <Login
            onLogin={(user) => {
              setUser(user);
              setView("dashboard");
            }}
          ></Login>
        )}

        {view === "dashboard" && (
          <main className={tw`flex flex-col gap-4 p-12`}>
            <div className={tw`p-8 bg-blue-100`}>
              <p>
                Pellentesque habitant morbi tristique senectus et netus et
                malesuada fames ac turpis egestas. Vestibulum tortor quam,
                feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu
                libero sit amet quam egestas semper. Aenean ultricies mi vitae
                est. Mauris placerat eleifend leo.
              </p>
            </div>

            <div>
              <button
                className={tw`px-8 py-4 text-white bg-blue-700`}
                onClick={increment}
              >
                Increment
              </button>
            </div>

            <div className={tw`p-8 bg-green-100`}>
              <p>
                Pellentesque habitant morbi tristique senectus et netus et
                malesuada fames ac turpis egestas. Vestibulum tortor quam,
                feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu
                libero sit amet quam egestas semper. Aenean ultricies mi vitae
                est. Mauris placerat eleifend leo.
              </p>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
