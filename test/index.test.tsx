import React, { act } from "react";
import { test, expect, mock } from "bun:test";
import { screen, render, waitFor } from "@testing-library/react";
import { MyComponent } from "./MyComponent";
import Xavier, { useExperimentSummaries } from "../src/index";
import { ExperimentAssignments, XavierApplication, XavierRequestConfig } from "../src/xavier";
import { sleep } from "bun";

const DEFAULT_TIMEOUT_MS = 1000;


test("If Xavier is not configured, an error is thrown when useExperiment() is called", () => {
  expect(() => render(<MyComponent defaultMessage="" />)).toThrowError(
    "Xavier is not configured. Please add <Xavier apiToken='...'> with a valid token to your component tree.",
  );
});

test("If Xavier is configured, but the experiment fails to be evaluated, the default value is used instead", async () => {
  class MockXavierError extends XavierApplication {
    override async getAllExperiments(config?: XavierRequestConfig): Promise<ExperimentAssignments> {
      throw new Error("Failed to evaluate experiment");
    }
  }

  mock.module("../src/xavier", () => {
    return {
      XavierApplication: MockXavierError,
    };
  });

  const message = "Just a test!";

  const result = render(
    <Xavier apiToken="" applicationId="" baseUrl="" disableCache={true}>
      <MyComponent defaultMessage={message} />
    </Xavier>,
  );

  // "Loading" state should be shown immediately.
  expect(result.getByTestId("my-component").textContent).toBe("Loading");

  // Now, MockXavier will return an error, so the default message should be rendered instead
  await waitFor(() => {
    // Check that the default message is now displayed
    expect(result.getByTestId("my-component").textContent).toBe(message);
  })

});


test("If Xavier is configured, but the experiment in question is not found, the default value is used instead", async () => {
  class MockXavierEmpty extends XavierApplication {
    override async getAllExperiments(options?: XavierRequestConfig): Promise<ExperimentAssignments> {
      return new Map();
    }
  }

  mock.module("../src/xavier", () => {
    return {
      XavierApplication: MockXavierEmpty,
    };
  });

  const message = "Just a test!";

  const result = render(
    <Xavier apiToken="" applicationId="" baseUrl="" disableCache={true}>
      <MyComponent defaultMessage={message} />
    </Xavier>,
  );

  // Wait for the "Loading" text to appear
  await waitFor(() => {
    expect(result.getByText("Loading")).toBeInTheDocument();
  });

  // Now, MockXavier will return an empty dictionary, so the default message should be rendered instead
  await act(async () => {
    await sleep(DEFAULT_TIMEOUT_MS);
  });

  // Check that the default message is now displayed
  await waitFor(() => {
    expect(result.getByText(message)).toBeInTheDocument();
  });
});

test("If Xavier is configured, and the experiment in question is in the map, the treatment value is used instead", async () => {
  const treatmentMessage = "A test treatment!";

  class MockXavierSingle extends XavierApplication {
    override async getAllExperiments(options?: XavierRequestConfig): Promise<ExperimentAssignments> {
      return new Map([
        [
          "exp-test",
          {
            experimentId: "exp-test",
            treatmentId: "tr-a",
            data: treatmentMessage,
          },
        ],
      ]);
    }
  }

  mock.module("../src/xavier", () => {
    return {
      XavierApplication: MockXavierSingle,
    };
  });

  const message = "Just a test!";

  const result = render(
    <Xavier apiToken="" applicationId="" baseUrl="" disableCache={true}>
      <MyComponent experimentId="exp-test" defaultMessage={message} />
    </Xavier>,
  );

  // Now, MockXavier will return a real dictionary, so the treatment message should be rendered instead
  await act(async () => {
    await sleep(DEFAULT_TIMEOUT_MS);
  });

  // Check that the default message is now displayed
  expect(result.getByText(treatmentMessage)).toBeInTheDocument();
});

test("If Xavier is configured, and the experiment in question is in the map, the treatment summaries are correct", async () => {
  const treatmentMessage = "A test treatment!";

  class MockXavierMultiple extends XavierApplication {
    override async getAllExperiments(): Promise<ExperimentAssignments> {
      return new Map([
        [
          "exp-test",
          {
            experimentId: "exp-test",
            treatmentId: "tr-a",
            data: treatmentMessage,
          },
        ],
        [
          "exp-test2",
          {
            experimentId: "exp-test2",
            treatmentId: "tr-b",
            data: treatmentMessage,
          },
        ],
      ]);
    }
  }

  mock.module("../src/xavier", () => {
    return {
      XavierApplication: MockXavierMultiple,
    };
  });

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
    <Xavier apiToken="" applicationId="" baseUrl="" disableCache={true}>
      <SummariesComponent />
    </Xavier>,
  );

  await waitFor(() => {
    // Check if the treatment message is displayed after waiting a bit
    const resolvedMessageElement = screen.getByTestId("my-component");
    expect(resolvedMessageElement).textContent?.toBeEqual(
      JSON.stringify({
        "exp-test": "tr-a",
        "exp-test2": "tr-b",
      }),
    );
  });
});
