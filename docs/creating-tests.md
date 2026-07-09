For tests, we're using vitest.

TEST STRUCTURE: Given-When-Then

```ts
1. describe("Feature/Method")       -> The Subject Under Test (SUT)
2.   describe("Given Scenario")     -> Preconditions / Initial state
3.     describe("When Action")      -> The specific call or trigger
4.       it("Then Assertion")       -> The expected outcome / Verification
```

Rules:

- No Shared State: Avoid beforeEach; keep setup inside the 'it' block.
- Functional Flow: Given (Setup) -> When (Action) -> Then (Expectation).

See [packages/core/todos/todo.test.ts](../packages/core/todos/todo.test.ts) for an example.
