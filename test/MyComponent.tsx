import React from 'react';
import { useExperiment } from "../src";


export function MyComponent({experimentId = "test", defaultMessage}: {experimentId?: string, defaultMessage: string}): React.ReactNode {
  const {data, error, isLoading} = useExperiment<string>(experimentId, defaultMessage);
  if (isLoading) {
    return <div data-testid="my-component">Loading</div>;
  } else if (data) {
    return <div data-testid="my-component">{data}</div>;
  } else {
    return <div data-testid="my-component">{error}</div>;
  }
}