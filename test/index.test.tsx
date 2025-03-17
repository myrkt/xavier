import React from 'react';
import { test, expect, mock } from 'bun:test';
import { screen, render } from '@testing-library/react';
import { MyComponent } from './MyComponent';
import Xavier from '../src/index';


const DEFAULT_TIMEOUT_MS = 100;


test('If Xavier is not configured, an error is thrown when useExperiment() is called', () => {
  expect(() => render(<MyComponent defaultMessage=''/>)).toThrowError('API token is not configured. Please call Xavier.configure() with a valid token.');
});


test('If Xavier is configured, but the experiment fails to be evaluated, the default value is used instead', () => {
  mock.module("../src/index", () => {
    return {
      Xavier,
      getAllExperiments: async () => {
        throw new Error("Failed to evaluate experiment")
      }
    };
  });

  Xavier.configure('valid-app-id', 'valid-api-token');

  const message = 'Just a test!'

  render(<MyComponent defaultMessage={message}/>);

  // Check if the loading value is used
  const loadingElement = screen.getByText("Loading");
  expect(loadingElement).toBeInTheDocument();

  // Check if the default message is displayed after waiting 200ms
  setTimeout(() => {
    const resolvedMessageElement = screen.getByText(message);
    expect(resolvedMessageElement).toBeInTheDocument();
  }, DEFAULT_TIMEOUT_MS);
});


test('If Xavier is configured, but the experiment in question is not found, the default value is used instead', () => {
  mock.module("../src/index", () => {
    return {
      Xavier,
      getAllExperiments: async () => new Map()
    };
  });

  Xavier.configure('valid-app-id', 'valid-api-token');

  const message = 'Just a test!'

  render(<MyComponent experimentId="not-a-real-experiment" defaultMessage={message}/>);

  // Check if the loading value is used
  const loadingElement = screen.getByText("Loading");
  expect(loadingElement).toBeInTheDocument();

  // Check if the default message is displayed after waiting a bit
  setTimeout(() => {
    const resolvedMessageElement = screen.getByText(message);
    expect(resolvedMessageElement).toBeInTheDocument();
  }, DEFAULT_TIMEOUT_MS);
});


test('If Xavier is configured, and the experiment in question is in the map, the treatment value is used instead', () => {
  const treatmentMessage = 'A test treatment!'
  mock.module("../src/index", () => {
    return {
      Xavier,
      getAllExperiments: async () => new Map([['test', {experimentId: 'test', treatment: treatmentMessage}]])
    };
  });

  Xavier.configure('valid-app-id', 'valid-api-token');

  const message = 'Just a test!'

  render(<MyComponent defaultMessage={message}/>);

  // Check if the loading value is used
  const loadingElement = screen.getByText("Loading");
  expect(loadingElement).toBeInTheDocument();

  // Check if the treatment message is displayed after waiting a bit
  setTimeout(() => {
    const resolvedMessageElement = screen.getByText(treatmentMessage);
    expect(resolvedMessageElement).toBeInTheDocument();
  }, DEFAULT_TIMEOUT_MS);
});