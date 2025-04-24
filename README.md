# Xavier

Client library for the Myrkt geobased experimentation platform.

## Using Xavier

In Myrkt, a user may have many different applications, each of which has its own
experiments. For example, you may have an iOS app which has a different set of
experiments than your website.

Experiments represent a hypothesis about something that might help improve
conversion, revenue, or some other metric. Each experiment has a unique ID that
begins with `exp-`. Each experiment has several treatment groups - these are
the different variations that clients will use to create the experiences being
tested.

Unlike some other testing platforms, each treatment is not just a boolean or a
string, but an arbitrary JSON blob that may contain an entire complex
configuration object. To refer to each treatment, we therefore have a treatment
ID that begins with `tr-` that is unique for that experiment.

For example, here is an response that might be returned from the assignment backend:

```json
{
  "exp-first-experiment": {
    "data": {
      "discountSku": "..."
    },
    "experimentId": "exp-first-experiment",
    "treatmentId": "tr-1b"
  },
  "exp-second-experiment": {
    "data": {
      "textOnButton": "Buy now!"
    },
    "experimentId": "exp-second-experiment",
    "treatmentId": "tr-2b"
  }
}
```

In this case, we have two live experiments, `exp-first-experiment` and
`exp-second-experiment`. This user has been assigned to treatment group `tr-1b`
in the first experiment and treatment group `tr-2b` in the second experiment.

## Usage in React applications

In React applications, Xavier can be initialized using the default `Xavier` hook, like this:

```tsx
import Xavier from "xavier";

function App() {
  return (
    <Xavier applicationId="..." apiToken="...">
      <ExperimentComponent />
    </Xavier>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
```

This allows anything lower in the component chain to access the `useExperiment`
hook to drive experiments, like this:

```tsx
import { useExperiment } from "xavier";

function ExperimentComponent() {
  const { {textOnButton}, isLoading, error } = useExperiment<{textOnButton: string}>("exp-second-experiment", {textOnButton: "Shop Now"});

  return <Button>{textOnButton}</Button>;
}
```

The `useExperiment<T>()` hook takes a type parameter that represents the
expected type of the JSON data that has been assigned to the treatment group, in
this case, an object with the single key "textOnButton". The provided default
value **must match this type**.

In this case, for a user visiting the page for the first time, the above button
will briefly show "Shop Now" (the default value) before the value is retrieved
from the backend. Once retrieved, this value will be cached in the session so
when the user returns to the site, the flicker won't happen.

### Handling the loading state explicitly

For some experiments, this flicker might be highly undesirable, so we can use
the `isLoading` boolean to hide the component while the loading state is
happening. Note that if the load fails for any reason - for example, if the
user's internet cuts out, or the test in question is no longer active - the user
will be assigned the default group.

```tsx
function ExperimentComponent() {
  const { {textOnButton}, isLoading, error } = useExperiment<{textOnButton: string}>("exp-second-experiment", {textOnButton: "Shop Now"});

  if (isLoading) {
    return null; // wait to instantiate the button for the loading to complete
  }

  return <Button>{textOnButton}</Button>;
}
```

Now, the button will not be rendered until the loading is complete, and its
first render will include the text of the treatment group the user was assigned
to, or fall back to the default if there is an error.

## Usage in Javascript applications

Sometimes, we may want to interact with Xavier directly, such as in middleware
or lambda functions. In this case, rather than working with React hooks, we'll
go directly through an XavierApplication instance.

```ts
import { XavierApplication } from 'xavier';

function handleRequest() {
    ...

    const xavier = new XavierApplication(applicationId, apiToken);

    const options = {clientIp: "102.184.9.1"};

    const {discountSku} = await xavier.getOneExperiment<{discountSku: string}>("exp-first-experiment", {discountSku: "11117da8-e6dc-4b87-8927-cd6717acec6a"}, options)

    return redirect(`/products/${discountSku}`);
}
```

In this example, we instantiate an XavierApplication instance and then check on
the treatment of a single experiment, roughly equivalent to `useExperiment` -
but note that this result will NOT be cached in any way, so subsequent calls
will result in other requests to the backend.

**IMPORTANT** In this case, since the request is coming from middleware, we need
to explicitly tell the backend the client IP of the user who is making the
original request so that they can be properly geolocated and assigned to a
treatment group.

In this experiment, we are retrieving the SKU that will receive a discount.


## Development

```bash
# install dependencies
bun install

# test the app
bun test

# build the app, available under dist
bun run build
```

## License

MIT
