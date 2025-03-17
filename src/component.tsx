import React, { createContext, ReactNode } from "react";
import { XavierApplication } from "./xavier";

export const XavierContext = createContext<XavierApplication | null>(null);

interface XavierProviderProps {
  applicationId: string;
  apiToken: string;
  children: ReactNode;
}

export const XavierProvider: React.FC<XavierProviderProps> = ({
  applicationId,
  apiToken,
  children,
}) => {
  const instance = new XavierApplication(applicationId, apiToken);

  return (
    <XavierContext.Provider value={instance}>{children}</XavierContext.Provider>
  );
};
