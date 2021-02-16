# 🧰 cmdkit

Command palette component for React

# Getting started

```bash
npm i cmdkit
```

**Simple example**

```tsx
import { CommandPalette } from "cmdkit";

const logTime = {
  id: "logTime",
  name: "Log current time",
  command: () => console.log(new Date()),
  view: <p>Running this command will log the current time</p>,
};

const App = () => {
  return (
    <div>
      <CommandPalette commands={[logTime]} />
      {/* rest of the app*/}
    </div>
  );
};
```

**Advanced example**

```tsx
// index.ts - outside of where `CommandPalette` is used
import { CommandEventProvider } from "cmdkit";

ReactDOM.render(
  <CommandEventProvider>
    <App />
  </CommandEventProvider>,
  document.getElementById("root")
);

// App.tsx
import { CommandPalette, useAppearEvent } from "cmdkit";

const useCounterLog = () => {
  const id = "counterLog";

  const [count, setCount] = useState(0);

  useAppearEvent(id, () => setCount((prev) => prev + 1));

  return {
    id,
    name: `Log the current time`,
    command: () => console.log(new Date()),
    view: <p>This command has appeared in the search results {count} times</p>,
  };
};

const App = () => {
  const counterLog = useCounterLog();
  return (
    <div>
      <CommandPalette commands={[counterLog]} />
      {/* rest of the app*/}
    </div>
  );
};
```

# API Reference

## Types

### `Command`

[`<CommandPalette />`](#commandpalette) accepts a list of `Command`s, which is an object with the following properties:

- `id` A string that uniquely identifies the command
- `name` The displayed name in the command palette
- `command` (Optional) The function to run when the command is selected
- `view` (Optional) A React element to show in the pane next to the search results

```tsx
import { Command } from "cmdkit";

const logTime: Command = {
  id: "logTime",
  name: "Log the current time",
  command: () => console.log(new Date()),
  view: (
    <div>
      <p>This command logs the current time</p>
    </div>
  ),
};
```

## Components

### `CommandPalette`

Renders a command palette in your application

- Open with `⌘ + K` (Mac) or `Alt + K` (Windows).
- Navigate commands with up and down arrows
- Run a command by pressing `Enter`
- `Esc` to close

Accepts a list of [`Command`]()s through the `commands` prop.

```tsx
import { CommandPalette } from "cmdkit";

const App = () => (
  <div>
    <CommandPalette
      commands={[
        {
          id: "simpleCommand",
          name: "A simple command",
          command: () => console.log("That was simple!"),
        },
      ]}
    />
    <h1>My app</h1>
  </div>
);
```

### `CommandEventProvider`

Manages the state of [event hooks](#hooks) which commands can use to provide advanced functionality.

Must be used outside the component which renders the `<CommandPalette />` component.

```tsx
import { CommandPalette, CommandEventProvider } from "cmdkit"

const App = () => <div>
  <CommandPalette commands={...} />
  <h1>My app</h1>
</div>

const Root = () => <CommandEventProvider>
  <App />
</CommandEventProvider>
```

## Hooks

cmdkit provides a couple of hooks for tapping into a command's life cycle.

**Note**: Usage of these hooks must happen within a `CommandEventProvider />`

### `useAppearEvent`

Allows you to run code when the command appears in the search results. Will re-run each time the command appears.

```ts
import { useAppearEvent } from "cmdkit";

useAppearEvent("myCommand", () => console.log("just appeared!"));
```

### `useFocusEvent`

Allows you to run code when the command receives focus in the search results.

```ts
import { useFocusEvent } from "cmdkit";

useFocusEvent("myCommand", () => console.log("received focus!"));
```

### `useBlurEvent`

Allows you to run code when the command loses focus in the search results.

```ts
import { useFocusEvent } from "cmdkit";

useFocusEvent("myCommand", () => console.log("lost focus!"));
```

### `useExecuteEvent`

Allows you to run additional code when a command is executed.

Most of the time you would probably include this code directly in the command's `command` function, but it might be useful if the command in question isn't in scope of whatever is depending on it.

```ts
import { useExecuteEvent } from "cmdkit";

useExecuteEvent("myCommand", () => console.log("command was executed"));
```

### `useDoneEvent`

Allows you to run additional code when a command has finished executing.

```ts
import { useDoneEvent } from "cmdkit";

useDoneEvent("myCommand", () => console.log("command is done excecuting!"));
```
