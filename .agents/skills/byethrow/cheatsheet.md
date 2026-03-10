# byethrow method cheat sheet

### 1. Transform (change what's inside)

| Method         | On success                          | On failure                          | Returns                                          |
| :------------- | :---------------------------------- | :---------------------------------- | :----------------------------------------------- |
| `map(fn)`      | `fn(value)` -> wraps in Success     | skipped                             | **new value**, same error type                   |
| `mapError(fn)` | skipped                             | `fn(error)` -> wraps in Failure     | same value, **new error type**                   |
| `andThen(fn)`  | `fn(value)` -> must return a Result | skipped                             | **new Result** (can change both value and error) |
| `orElse(fn)`   | skipped                             | `fn(error)` -> must return a Result | **new Result** (recovery attempt)                |

Mental model:

- `map` = I want to change the success value, and I can't fail
- `andThen` = I want to change the success value, and I might fail (flatMap)

### 2. Side-effect that preserves the original (passthrough)

| Method             | On success                             | On failure                             | Returns                                                                |
| :----------------- | :------------------------------------- | :------------------------------------- | :--------------------------------------------------------------------- |
| `andThrough(fn)`   | `fn(value)` -> must return a Result    | skipped                                | **original success value**, but if `fn` fails, that Failure propagates |
| `orThrough(fn)`    | skipped                                | `fn(error)` -> must return a Result    | **original error**, but if `fn` fails, that new Failure replaces it    |
| `inspect(fn)`      | `fn(value)` -> pure side-effect (void) | skipped                                | original Result unchanged                                              |
| `inspectError(fn)` | skipped                                | `fn(error)` -> pure side-effect (void) | original Result unchanged                                              |

Mental model:

- `andThrough` = I need to do something that can fail (like upsert), but I want to keep the original value flowing
- `inspect` / `inspectError` = logging, debugging, rollback side-effects (can't fail)

### 3. Resolve (exit the Result)

| Method                  | Behavior                                              |
| :---------------------- | :---------------------------------------------------- |
| `unwrap(result)`        | Success → value, Failure → throws the error           |
| `unwrapError(result)`   | Failure → error, Success → throws                     |
| `isSuccess(result)`     | type guard, narrows to Success                        |
| `isFailure(result)`     | type guard, narrows to Failure                        |
| `assertSuccess(result)` | compile-time assertion (error type must be `never`)   |
| `assertFailure(result)` | compile-time assertion (success type must be `never`) |

### 4. Combine

| Method            | Behavior                                            |
| :---------------- | :-------------------------------------------------- |
| `sequence([...])` | All must succeed, short-circuits on first failure   |
| `collect([...])`  | All must succeed, collects **all** errors           |
| `do() + bind()`   | Accumulate named values step by step into an object |
