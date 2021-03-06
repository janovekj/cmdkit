import { useMachine } from "fini";
import React, {
  useCallback,
  useRef,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useCommandPaletteHotkeys } from "./useCommandPaletteHotkeys";
import { Overlay } from "./Overlay";
import { useSearch } from "./useSearch";
import { tw, setup } from "twind";

// All settings here should be reflected in `tailwind.config.js`
setup({
  theme: {
    extend: {
      maxHeight: {
        100: "25rem",
      },
    },
  },
});

type On = {
  down: VoidFunction;
  up: VoidFunction;
  select: VoidFunction;
  change: (value: string) => void;
};

type InputProps = {
  on: On;
  value: string;
  iRef: React.MutableRefObject<HTMLInputElement | null>;
};

const Input = ({ value, iRef, ...rest }: InputProps) => (
  <input
    className={tw`flex items-center w-full px-8 py-4 text-xl text-white placeholder-gray-400 bg-transparent border-b border-gray-600 outline-none border-opacity-80 focus:outline-none `}
    autoFocus
    placeholder="Køyr"
    ref={iRef}
    onKeyDown={(event) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          rest.on.down();
          break;
        case "ArrowUp":
          event.preventDefault();
          rest.on.up();
          break;
        case "Enter":
          event.preventDefault();
          rest.on.select();
          break;
      }
    }}
    value={value}
    onChange={(event) => rest.on.change(event.target.value)}
  ></input>
);

const Box: React.FC = ({ children }) => {
  return (
    <div
      style={{ backdropFilter: "blur(2px)" }}
      className={tw`fixed flex-col w-full max-w-3xl overflow-hidden text-white bg-gray-900 border-2 border-gray-600 shadow-2xl border-opacity-40 bg-opacity-90 rounded-2xl top-40`}
    >
      {children}
    </div>
  );
};

type CommandPaletteMachine = {
  states: {
    closed: {
      events: {
        open: void;
      };
    };
    typing: {
      events: {
        change: string;
        up: void;
        down: void;
        select?: number;
        highlight: number;
        close: void;
      };
    };
    executing: {
      context: {
        command: Command;
      };
      events: {
        done: void;
        close: void;
      };
    };
  };
  context: {
    value: string;
    index: number;
  };
};

const NoResults = () => {
  return (
    <p
      className={tw`flex flex-col items-center justify-center w-full gap-2 p-4 text-xl font-light`}
    >
      <span>No results</span>
      <span aria-hidden className={tw`text-xl`}>
        ¯\_(ツ)_/¯
      </span>
    </p>
  );
};

const Options: React.FC = ({ children }) => (
  <ul
    className={tw`flex flex-col w-2/5 p-3 overflow-y-scroll border-r border-gray-600 max-h-100`}
  >
    {children}
  </ul>
);

const Option: React.FC<{
  state: "normal" | "selected";
  onSelect: VoidFunction;
  onHighlight: VoidFunction;
}> = ({ children, state, onSelect, onHighlight }) => (
  <li>
    <button
      className={tw`relative px-8 rounded-md w-full py-2 text-base text-left focus:outline-none hover:bg-gray-500 hover:bg-opacity-70 ${
        state === "selected" ? "bg-gray-600 bg-opacity-60" : ""
      }`}
      tabIndex={-1}
      onClick={onSelect}
      onAuxClick={onHighlight}
    >
      {state === "selected" && (
        <span
          style={{
            top: "calc(50% - 3px)",
            left: "12px",
            height: "6px",
            width: "6px",
          }}
          className={tw`absolute bg-white rounded-sm`}
        ></span>
      )}
      {children}
    </button>
  </li>
);

const Hotkey: React.FC<{
  keyCode: string;
  action: string;
}> = ({ keyCode, action }) => (
  <li className={tw`flex items-center gap-2`}>
    <span className={tw`px-2 py-1 bg-gray-600 rounded-md`}>{keyCode}</span>
    <span>{action}</span>
  </li>
);

const Hotkeys = () => (
  <ul className={tw`flex gap-4 px-4 py-4 text-xs`}>
    <Hotkey keyCode={"Esc"} action={"Close"}></Hotkey>
    <Hotkey keyCode={"↵"} action={"Run"}></Hotkey>
    <Hotkey keyCode={"↑↓"} action={"Navigate"}></Hotkey>
  </ul>
);

type CommandResult = void | Promise<void>;

export interface Command {
  id: string;
  name: string;
  command?: () => CommandResult;
  view?: React.ReactNode;
}

interface RequiredCommand extends Command {
  command: () => CommandResult;
}

const isRequiredCommand = (command: Command): command is RequiredCommand =>
  !!command.command;

type CommandEvent = "focus" | "blur" | "execute" | "done" | "appear";

type CommandEventObject = {
  id: string;
  event: CommandEvent;
};

const SubscribeContext = React.createContext<
  | ((
      event: CommandEvent,
      id: string,
      eventHandler: EventHandler
    ) => () => void)
  | undefined
>(undefined);

const NotifyContext = React.createContext<
  ((events: CommandEventObject[]) => void) | undefined
>(undefined);

type SubscriptionEvent =
  | {
      type: "subscribe";
      id: string;
      event: CommandEvent;
      eventHandler: EventHandler;
    }
  | {
      type: "unsubscribe";
      id: string;
      event: CommandEvent;
      eventHandler: EventHandler;
    };

type Subscription = [
  event: CommandEvent,
  id: string,
  eventHandler: EventHandler
];

type EventHandler = () => void;

export const CommandEventProvider: React.FC = ({ children }) => {
  // TODO: rewrite as subscription machine? can support cleanup functions
  const [subscriptions, dispatch] = useReducer(
    (state: Subscription[], subEvent: SubscriptionEvent): Subscription[] => {
      switch (subEvent.type) {
        case "subscribe":
          return [
            ...state,
            [subEvent.event, subEvent.id, subEvent.eventHandler],
          ];
        case "unsubscribe": {
          return state.filter(
            ([event, id, eventHandler]) =>
              event === subEvent.id &&
              id === subEvent.id &&
              eventHandler === subEvent.eventHandler
          );
        }
        default:
          return state;
      }
    },
    []
  );

  const subscribe = useCallback(
    (event: CommandEvent, id: string, eventHandler: () => void) => {
      dispatch({ type: "subscribe", event, id, eventHandler });

      return () => dispatch({ type: "unsubscribe", event, id, eventHandler });
    },
    []
  );

  const notify = useCallback(
    (events: CommandEventObject[]) => {
      events.forEach((notifyEvent) => {
        subscriptions.forEach(([event, id, eventHandler]) => {
          if (id === notifyEvent.id && notifyEvent.event === event) {
            eventHandler();
          }
        });
      });
    },
    [subscriptions]
  );

  return (
    <SubscribeContext.Provider value={subscribe}>
      <NotifyContext.Provider value={notify}>{children}</NotifyContext.Provider>
    </SubscribeContext.Provider>
  );
};

const useEvent = (
  event: CommandEvent,
  id: string,
  eventHandler: EventHandler
) => {
  const subscribe = useContext(SubscribeContext);
  if (!subscribe) {
    throw new Error("Event hooks must be used inside a CommandEventProvider");
  }

  useEffect(() => {
    const unsubscribe = subscribe(event, id, eventHandler);
    return unsubscribe;
  }, [event, id, eventHandler, subscribe]);
};

/**
 * Runs a given event handler when the specified command receives focus
 *
 * **Note:** can only be used inside a `<CommandEventProvider>`
 *
 * @param id command identifier
 * @param eventHandler function to run
 */
export const useFocusEvent = (id: string, eventHandler: EventHandler): void =>
  useEvent("focus", id, eventHandler);

/**
 * Runs a given event handler when the specified command loses focus
 *
 * **Note:** can only be used inside a `<CommandEventProvider>`
 *
 * @param id command identifier
 * @param eventHandler function to run
 */
export const useBlurEvent = (id: string, eventHandler: EventHandler): void =>
  useEvent("blur", id, eventHandler);

/**
 * Runs a given event handler when the specified command is executed
 *
 * **Note:** can only be used inside a `<CommandEventProvider>`
 *
 * @param id command identifier
 * @param eventHandler function to run
 */
export const useExecuteEvent = (id: string, eventHandler: EventHandler): void =>
  useEvent("execute", id, eventHandler);

/**
 * Runs a given event handler when the specified command is finished executing
 *
 * **Note:** can only be used inside a `<CommandEventProvider>`
 *
 * @param id command identifier
 * @param eventHandler function to run
 */
export const useDoneEvent = (id: string, eventHandler: EventHandler): void =>
  useEvent("done", id, eventHandler);

/**
 * Runs a given event handler when the specified command appears in the results
 *
 * **Note:** can only be used inside a `<CommandEventProvider>`
 *
 * @param id command identifier
 * @param eventHandler function to run
 */
export const useAppearEvent = (id: string, eventHandler: EventHandler): void =>
  useEvent("appear", id, eventHandler);

interface CommandPaletteProps {
  commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ commands }) => {
  const notify = useContext(NotifyContext);

  const search = useSearch(commands);

  const inputRef = useRef<HTMLInputElement>(null);

  const input = useMachine<CommandPaletteMachine>(
    {
      closed: {
        open: ({ update }) =>
          update.typing({
            index: 0,
            value: "",
          }),
      },
      typing: {
        $entry: () => inputRef.current?.focus(),
        change: ({ update, context }, value) => {
          return update.typing({ value, index: 0 }, () => {
            const currentResults = search(context.value);
            const currentCommand = currentResults[context.index];

            const nextResults = search(value);
            const nextCommand = nextResults[context.index];

            const ids = new Set(currentResults.map(({ id }) => id));

            const notifications: CommandEventObject[] = [];

            nextResults
              .filter((nextCommand) => {
                return !ids.has(nextCommand.id);
              })
              .forEach((relevantCommand) =>
                notifications.push({ id: relevantCommand.id, event: "appear" })
              );

            if (nextCommand !== currentCommand) {
              if (currentCommand) {
                notifications.push({ id: currentCommand.id, event: "blur" });
              }
              if (nextCommand) {
                notifications.push({ id: nextCommand.id, event: "focus" });
              }
            }
            notify?.(notifications);
          });
        },
        down: ({ update, context }) => {
          const results = search(context.value);

          if (!results.length) {
            return false;
          }

          const nextIndex =
            context.index + 1 === results.length ? 0 : context.index + 1;

          return update.typing({ index: nextIndex }, () => {
            const currentCommand = results[context.index];
            const nextCommand = results[nextIndex];
            notify?.([
              { id: currentCommand.id, event: "blur" },
              { id: nextCommand.id, event: "focus" },
            ]);
          });
        },
        up: ({ update, context }) => {
          const results = search(context.value);

          if (!results.length) {
            return false;
          }

          const nextIndex =
            context.index - 1 < 0 ? results.length - 1 : context.index - 1;

          return update.typing({ index: nextIndex }, () => {
            const currentCommand = results[context.index];
            const nextCommand = results[nextIndex];
            notify?.([
              { id: currentCommand.id, event: "blur" },
              { id: nextCommand.id, event: "focus" },
            ]);
          });
        },
        select: ({ update, context }, index) => {
          const command = search(context.value)[index ?? context.index];

          return isRequiredCommand(command)
            ? update.executing({ command }, (dispatch) => {
                notify?.([
                  {
                    id: command.id,
                    event: "execute",
                  },
                ]);
                Promise.resolve(command.command()).then(() => {
                  dispatch.done();
                });
              })
            : undefined;
        },
        highlight: ({ update }, index) => {
          return update.typing({ index });
        },
        close: ({ update }) => update.closed(),
      },
      executing: {
        done: ({ update, context }) => {
          update((d) => {
            notify?.([
              {
                id: context.command.id,
                event: "done",
              },
            ]);
            d.close();
          });
        },
        close: ({ update }) => update.closed(),
      },
    },
    (initial) => initial.closed({ value: "", index: 0 })
  );

  useCommandPaletteHotkeys({
    onClose: input.close,
    onToggle: input.closed ? input.open : input.close,
    onSelect: input.select,
  });

  const results = search(input.context.value);

  return !input.closed ? (
    <Overlay onClick={input.close}>
      <Box>
        <Input on={input} value={input.context.value} iRef={inputRef}></Input>
        <div className={tw`flex border-b border-gray-600 border-opacity-80`}>
          {results.length ? (
            <>
              <Options>
                {results.map((result, idx) => (
                  <Option
                    key={result.id}
                    state={idx === input.context.index ? "selected" : "normal"}
                    onSelect={() => input.select(idx)}
                    onHighlight={() => input.highlight(idx)}
                  >
                    {result.markup}
                  </Option>
                ))}
              </Options>
              <div>
                {results.length ? results[input.context.index].view : null}
              </div>
            </>
          ) : (
            <NoResults />
          )}
        </div>
        <Hotkeys></Hotkeys>
      </Box>
    </Overlay>
  ) : null;
};
