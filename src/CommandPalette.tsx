import { useMachine } from "fini";
import React, {
  useCallback,
  useRef,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { useToggleHotkeys } from "./useToggleHotkeys";
import { Overlay } from "./Overlay";
import { useSearch } from "./useSearch";
import { tw, setup } from "twind";

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
    className={tw`flex items-center w-full px-8 py-4 text-2xl border-b border-gray-300 outline-none bg-gray-50 focus:outline-none `}
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
      className={tw`fixed flex-col w-full max-w-3xl overflow-hidden bg-gray-100 border border-gray-300 shadow-2xl rounded-2xl top-40`}
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

const Options: React.FC = ({ children }) => (
  <ul
    className={tw`flex flex-col w-2/5 overflow-y-scroll border-r border-gray-300 max-h-100`}
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
      className={tw`px-8 w-full py-2 text-base text-left focus:outline-none hover:bg-blue-200 border-l-2 ${
        state === "selected"
          ? "bg-blue-100  border-blue-500"
          : "border-transparent"
      }`}
      tabIndex={-1}
      onClick={onSelect}
      onAuxClick={onHighlight}
    >
      {children}
    </button>
  </li>
);

type CommandResult = void | Promise<void>;

export interface Command {
  id: string;
  name: string;
  command?: () => CommandResult;
  view?: React.ReactNode; // or `outlet`?
}

interface RequiredCommand extends Command {
  command: () => CommandResult;
}

const isRequiredCommand = (command: Command): command is RequiredCommand =>
  !!command.command;

type CommandEvent = "focus" | "blur" | "execute" | "done";

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
            const currentCommand = search(context.value)[context.index];
            const nextCommand = search(value)[context.index];

            if (nextCommand !== currentCommand) {
              const notifications: CommandEventObject[] = [];
              if (currentCommand) {
                notifications.push({ id: currentCommand.id, event: "blur" });
              }
              if (nextCommand) {
                notifications.push({ id: nextCommand.id, event: "focus" });
              }
              notify?.(notifications);
            }
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

  useToggleHotkeys({
    onClose: input.close,
    onToggle: input.closed ? input.open : input.close,
  });

  const results = search(input.context.value);

  return !input.closed ? (
    <Overlay onClick={input.close}>
      <Box>
        <Input on={input} value={input.context.value} iRef={inputRef}></Input>
        <div className={tw`flex`}>
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
          <div>{results.length ? results[input.context.index].view : null}</div>
        </div>
      </Box>
    </Overlay>
  ) : null;
};
