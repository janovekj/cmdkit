import { useMachine } from "fini";
import React, {
  useCallback,
  useRef,
  memo,
  useMemo,
  useContext,
  useEffect,
  useState,
} from "react";
import fuzzysort from "fuzzysort";
import { useToggleHotkeys } from "./useToggleHotkeys";

const Input = React.forwardRef<
  HTMLInputElement,
  {
    on: {
      down: VoidFunction;
      up: VoidFunction;
      select: VoidFunction;
      change: (value: string) => void;
    };
    value: string;
  }
>(({ on, value }, ref) => (
  <input
    autoFocus
    placeholder="Køyr"
    className="w-full px-8 py-4 text-2xl outline-none bg-gray-50 focus:outline-none"
    ref={ref}
    onKeyDown={(event) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          on.down();
          break;
        case "ArrowUp":
          event.preventDefault();
          on.up();
          break;
        case "Enter":
          event.preventDefault();
          on.select();
          break;
      }
    }}
    value={value}
    onChange={(event) => on.change(event.target.value)}
  ></input>
));

const highlightOpen = `<b style="color: var(--highlight-color)">`;
const highlightClose = `</b>`;

type CommandPaletteMachine = {
  states: {
    typing: {
      events: {
        change: string;
        up: void;
        down: void;
        select?: number;
      };
      context: {
        value: string;
        index: number;
        // history: string[] with first one preselected
      };
    };
  };
};

const limit = 10;

const filterConfig = {
  allowTypo: true,
  key: "name",
  limit,
};

const filter = (commands: Command[]) => (value: string) => {
  return value.length
    ? fuzzysort.go(value, commands, filterConfig).map((res) => res.obj)
    : commands.filter((_, idx) => idx < limit);
};

export interface Command {
  id: string;
  name: string;
  command: () => void;
  view?: React.ReactNode;
}

interface Props {
  commands: Command[];
  /** If a Promise is returned,
   * command palette will not close before it resolves */
  onSelect: (command: Command) => void | Promise<any>;
  onClickOutside: () => void;
}

export const CommandPalette = ({
  commands,
  onSelect,
  onClickOutside,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const getResults = useCallback(filter(commands), [commands]);

  const input = useMachine<CommandPaletteMachine>(
    {
      typing: {
        $entry: () => inputRef.current?.focus(),
        change: ({ update }, value) => update.typing({ value, index: 0 }),
        down: ({ update, context }) => {
          const results = getResults(context.value);

          if (!results.length) {
            return false;
          }

          const nextIndex =
            context.index + 1 === results.length ? 0 : context.index + 1;

          return update.typing({ index: nextIndex });
        },
        up: ({ update, context }) => {
          const results = getResults(context.value);

          if (!results.length) {
            return false;
          }

          const nextIndex =
            context.index - 1 < 0 ? results.length - 1 : context.index - 1;

          return update.typing({ index: nextIndex });
        },
        select: ({ update, context }, index) =>
          update.typing(() => {
            onSelect(getResults(context.value)[index ?? context.index]);
          }),
      },
    },
    (initial) => initial.typing({ value: "", index: 0 })
  );

  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={containerRef}
      onClick={(event) => {
        if (event.target === containerRef.current) {
          onClickOutside();
        }
      }}
      style={
        {
          ["--highlight-color"]:
            // "#ff6528"
            "#0054ed",
        } as React.CSSProperties
      }
      className="absolute top-0 left-0 flex justify-center w-full h-full gap-5 p-8 "
    >
      <div className="fixed flex-col w-full max-w-3xl overflow-hidden bg-gray-100 border border-gray-300 shadow-2xl rounded-2xl top-40">
        <div className="flex items-center border-b border-gray-300">
          <Input on={input} value={input.context.value}></Input>
        </div>
        <Options
          commands={commands}
          search={input.context.value}
          index={input.context.index}
          onClickOption={input.select}
        ></Options>
      </div>
    </div>
  );
};

interface OptionsProps {
  search: string;
  commands: Command[];
  index: number;
  onClickOption: (index: number) => void;
}

const Options = memo(
  ({ search, commands, index, onClickOption }: OptionsProps) => {
    const targets = useMemo(
      () =>
        commands.map((opt) => ({
          ...opt,
          preparedName: fuzzysort.prepare(opt.name),
        })),
      [commands]
    );

    type Result = {
      name: string;
      markup: React.ReactNode;
      view: React.ReactNode;
    };

    const results: Result[] = useMemo(
      () =>
        search.length
          ? fuzzysort
              .go(search, targets, {
                ...filterConfig,
                key: "preparedName",
              })
              .map((res) => ({
                name: res.obj.name,
                view: res.obj.view,
                markup: (
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        fuzzysort.highlight(
                          res,
                          highlightOpen,
                          highlightClose
                        ) ?? res.obj.name,
                    }}
                  ></span>
                ),
              }))
          : targets
              .filter((_, idx) => idx < limit)
              .map((target) => ({
                name: target.name,
                view: target.view,
                markup: target.name,
              })),
      [search, targets]
    );

    return (
      <div className="flex">
        <ul className="flex flex-col w-2/5 overflow-y-scroll border-r border-gray-300 max-h-100">
          {results.map((result, idx) => (
            <li key={result.name}>
              <button
                className={`px-8 w-full py-2 text-base text-left focus:outline-none hover:bg-blue-200 border-l-2 ${
                  index === idx
                    ? "bg-blue-100  border-blue-500"
                    : "border-transparent"
                }`}
                tabIndex={-1}
                onClick={() => {
                  onClickOption(index);
                }}
              >
                {result.markup}
              </button>
            </li>
          ))}
        </ul>
        <div>{results.length ? results[index].view : null}</div>
      </div>
    );
  }
);

const CommandPaletteContext = React.createContext(false);

export const CommandPaletteYo = (props: Omit<Props, "onClickOutside">) => {
  const initialized = useContext(CommandPaletteContext);

  const initializedRef = useRef(false);
  if (initialized && !initializedRef.current) {
    throw new Error("Multiple command palettes are not supported");
  } else {
    initializedRef.current = true;
  }

  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  useToggleHotkeys({
    onClose: close,
    onToggle: () => setIsOpen((prev) => !prev),
  });

  return isOpen ? (
    <CommandPalette
      commands={props.commands}
      onSelect={(command) => {
        // TODO: check if next context is void
        Promise.resolve(command.command()).then(close);

        props.onSelect(command);
      }}
      onClickOutside={close}
    ></CommandPalette>
  ) : null;
};
