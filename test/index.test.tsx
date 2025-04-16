import React, { act } from "react";
import { test, expect, mock } from "bun:test";
import { screen, render } from "@testing-library/react";
import { MyComponent } from "./MyComponent";
import Xavier, { useExperimentSummaries } from "../src/index";
import { ExperimentAssignments, XavierApplication } from "../src/xavier";
import { sleep } from "bun";

const DEFAULT_TIMEOUT_MS = 100;

test("If Xavier is not configured, an error is thrown when useExperiment() is called", () => {
  expect(() => render(<MyComponent defaultMessage="" />)).toThrowError(
    "Xavier is not configured. Please add <Xavier apiToken='...'> with a valid token to your component tree.",
  );
});

test("If Xavier is configured, but the experiment fails to be evaluated, the default value is used instead", async () => {
  class MockXavier extends XavierApplication {
    override async getAllExperiments(): Promise<ExperimentAssignments> {
      throw new Error("Failed to evaluate experiment");
    }
  }

  mock.module("../src/xavier", () => {
    return {
      XavierApplication: MockXavier,
    };
  });

  const message = "Just a test!";

  await act(async () => {
    const result = render(
      <Xavier apiToken="" applicationId="" baseUrl="">
        <MyComponent defaultMessage={message} />
      </Xavier>,
    );

    expect(result.getByText("Loading")).toBeInTheDocument();

    // Check if the loading value is used
    await sleep(DEFAULT_TIMEOUT_MS);
  });

  render(
    <Xavier apiToken="" applicationId="">
      <MyComponent defaultMessage={message} />
    </Xavier>,
  );

  // Check if the default message is displayed after waiting 200ms
  const resolvedMessageElement = screen.getByText(message);
  expect(resolvedMessageElement).toBeInTheDocument();
});

test("If Xavier is configured, but the experiment in question is not found, the default value is used instead", async () => {
  class MockXavier extends XavierApplication {
    override async getAllExperiments(): Promise<ExperimentAssignments> {
      return new Map();
    }
  }

  mock.module("../src/xavier", () => {
    return {
      XavierApplication: MockXavier,
    };
  });

  const message = "Just a test!";

  render(
    <Xavier apiToken="" applicationId="">
      <MyComponent
        experimentId="not-a-real-experiment"
        defaultMessage={message}
      />
    </Xavier>,
  );

  // Check if the loading value is used
  const loadingElement = screen.getByText("Loading");
  expect(loadingElement).toBeInTheDocument();

  await act(async () => {
    await sleep(DEFAULT_TIMEOUT_MS);
  });
  render(
    <Xavier apiToken="" applicationId="">
      <MyComponent
        experimentId="not-a-real-experiment"
        defaultMessage={message}
      />
    </Xavier>,
  );

  // Check if the default message is displayed after waiting a bit
  const resolvedMessageElement = screen.getByText(message);
  expect(resolvedMessageElement).toBeInTheDocument();
});

test("If Xavier is configured, and the experiment in question is in the map, the treatment value is used instead", async () => {
  const treatmentMessage = "A test treatment!";

  class MockXavier extends XavierApplication {
    override async getAllExperiments(): Promise<ExperimentAssignments> {
      return new Map([
        ["exp-test", { experimentId: "exp-test", treatmentId: "tr-a", data: treatmentMessage }],
      ]);
    }
  }

  mock.module("../src/xavier", () => {
    return {
      XavierApplication: MockXavier,
    };
  });

  const message = "Just a test!";

  render(
    <Xavier apiToken="" applicationId="">
      <MyComponent experimentId="exp-test" defaultMessage={message} />
    </Xavier>,
  );

  // Check if the loading value is used
  const loadingElement = screen.getByText("Loading");
  expect(loadingElement).toBeInTheDocument();

  await act(async () => {
    await sleep(DEFAULT_TIMEOUT_MS);
  });

  render(
    <Xavier apiToken="" applicationId="">
      <MyComponent experimentId="exp-test" defaultMessage={message} />
    </Xavier>,
  );

  // Check if the treatment message is displayed after waiting a bit
  const resolvedMessageElement = screen.getByText(treatmentMessage);
  expect(resolvedMessageElement).toBeInTheDocument();
});


test("If Xavier is configured, and the experiment in question is in the map, the treatment summaries are correct", async () => {
  const treatmentMessage = "A test treatment!";

  class MockXavier extends XavierApplication {
    override async getAllExperiments(): Promise<ExperimentAssignments> {
      return new Map([
        [
          "exp-test", { experimentId: "exp-test", treatmentId: "tr-a", data: treatmentMessage }
        ],
        [
          "exp-test2", { experimentId: "exp-test2", treatmentId: "tr-b", data: treatmentMessage }
        ],
      ]);
    }
  }

  mock.module("../src/xavier", () => {
    return {
      XavierApplication: MockXavier,
    };
  });

  const message = "Just a test!";

  function SummariesComponent() {
    const { data, error, isLoading } = useExperimentSummaries();

    if (isLoading) {
      return <div data-testid="my-component">Loading</div>;
    } else if (data) {
      return (
        <div data-testid="my-component">
          {JSON.stringify(Object.fromEntries(data))}
        </div>
      );
    } else {
      return <div data-testid="my-component">{error}</div>;
    }
  }

  await act(async () => {
    await sleep(DEFAULT_TIMEOUT_MS);
  });

  render(
    <Xavier apiToken="" applicationId="">
      <SummariesComponent />
    </Xavier>,
  );

  // Check if the treatment message is displayed after waiting a bit
  const resolvedMessageElement = screen.getByTestId("my-component");
  expect(resolvedMessageElement).textContent?.toBeEqual(
    JSON.stringify({
      "exp-test": "tr-a",
      "exp-test2": "tr-b",
    })
  );
});
