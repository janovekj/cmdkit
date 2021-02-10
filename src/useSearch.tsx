import React, { useCallback, useMemo } from "react";
import fuzzysort from "fuzzysort";
import { Command } from "./CommandPalette";

const limit = 10;

const filterConfig = {
  allowTypo: true,
  key: "preparedName",
  limit,
};

interface PreparedCommand extends Command {
  preparedName: Fuzzysort.Prepared | undefined;
}

interface Result extends PreparedCommand {
  markup: React.ReactNode;
}

const highlightOpen = `<b style="color: var(--highlight-color)">`;
const highlightClose = `</b>`;

const filter = (commands: PreparedCommand[], search: string): Result[] =>
  search.length
    ? fuzzysort.go(search, commands, filterConfig).map((res) => ({
        ...res.obj,
        markup: (
          <span
            dangerouslySetInnerHTML={{
              __html:
                fuzzysort.highlight(res, highlightOpen, highlightClose) ??
                res.obj.name,
            }}
          ></span>
        ),
      }))
    : commands
        .filter((_, idx) => idx < limit)
        .map((target) => ({
          ...target,
          markup: target.name,
        }));

interface Search {
  (search: string): Result[];
}

export const useSearch = (commands: Command[]): Search => {
  const preparedCommands = useMemo(
    () =>
      commands.map((opt) => ({
        ...opt,
        preparedName: fuzzysort.prepare(opt.name),
      })),
    [commands]
  );

  const getResults = useCallback(
    (search: string) => filter(preparedCommands, search),
    [preparedCommands]
  );

  return getResults;
};
