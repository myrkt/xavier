import React, { createContext, ReactNode, useContext } from "react";
import { XavierApplication } from "./xavier";
import { SWRConfig } from "swr";

export const XavierContext = createContext<XavierApplication | null>(null);

interface XavierProviderProps {
  applicationId: string;
  apiToken: string;
  baseUrl?: string;
  children: ReactNode;
}

function localStorageProvider(key: string): Map<string, any> {
  // When initializing, we restore the data from `localStorage` into a map.
  if (typeof window === "undefined") {
    console.warn(
      "localStorageProvider is not supported in SSR. Please use a different provider.",
    );
    return new Map<string, any>();
  }

  const storedData = localStorage.getItem(key);
  const map = new Map<string, any>(
    storedData
      ? JSON.parse(storedData).map(([k, v]: [string, any]) => [k, v])
      : [],
  );

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener("beforeunload", () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem(key, appCache);
  });

  // We still use the map for write & read for performance.
  return map;
}

export const XavierProvider: React.FC<XavierProviderProps> = ({
  applicationId,
  apiToken,
  baseUrl,
  children,
}) => {
  const instance = new XavierApplication(applicationId, apiToken, baseUrl);
  const localStorageKey = `xavier-${applicationId}`;

  return (
    <XavierContext.Provider value={instance}>
      <SWRConfig>{children}</SWRConfig>
    </XavierContext.Provider>
  );
};

export const useXavier = (): XavierApplication => {
  const context = useContext(XavierContext);
  if (!context) {
    throw new Error(
      "Xavier is not configured. Please add <Xavier apiToken='...'> with a valid token to your component tree.",
    );
  }
  return context;
};
