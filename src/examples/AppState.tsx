import React, { createContext, useCallback, useContext, useState } from "react";

const AppStateContext = createContext<
  | {
      count: number;
      increment: () => void;
    }
  | undefined
>(undefined);

export const AppStateProvider: React.FC = ({ children }) => {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => setCount((prev) => prev + 1), []);

  return (
    <AppStateContext.Provider
      value={{
        count,
        increment,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
