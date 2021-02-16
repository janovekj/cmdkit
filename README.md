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
import { CommandPalette } from "cmdkit";

const useCounterLog = () => {
  const id = "counterLog";

  const [count, setCount] = useState(0);

  useExecuteEvent(id, () => setCount((prev) => prev + 1));

  return {
    id,
    name: `Log the current time`,
    command: () => console.log(new Date()),
    view: <p>Has logged the time {count} times</p>,
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
