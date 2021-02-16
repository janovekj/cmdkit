import React, { useState } from "react";
import { tw } from "twind";

export const fetchUser = (id: string): Promise<string> =>
  new Promise((res) =>
    setTimeout(() => {
      res(btoa(id).toLowerCase());
    }, 700)
  );

export const Login: React.FC<{
  onLogin: (id: string) => void;
}> = ({ onLogin }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    fetchUser("asdasd").then(onLogin);
    console.log({ name, password });
  };

  return (
    <form
      className={tw`flex flex-col items-start gap-4 p-8`}
      onSubmit={(event) => {
        event.preventDefault();
        handleLogin();
      }}
    >
      <label className={tw`flex flex-col gap-2 font-semibold`}>
        Username
        <input
          id="username"
          className={tw`px-4 py-2 border border-gray-500 rounded-md`}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <label className={tw`flex flex-col gap-2 font-semibold`}>
        Password
        <input
          id="password"
          className={tw`px-4 py-2 border border-gray-500 rounded-md`}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      <button
        id="submit"
        className={tw`p-4 text-white bg-blue-600 rounded-md disabled:bg-blue-100`}
        disabled={isLoading}
        type="submit"
        onClick={() => handleLogin()}
      >
        Submit
      </button>
    </form>
  );
};
