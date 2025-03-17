import React, { createContext, ReactNode } from "react";
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
  const map = new Map<string, any>(
    JSON.parse(localStorage.getItem(key) || "[]"),
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
      <SWRConfig
        value={{ provider: () => localStorageProvider(localStorageKey) }}
      >
        {children}
      </SWRConfig>
    </XavierContext.Provider>
  );
};
