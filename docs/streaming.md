# Streaming Contract

## Transport
- Server-Sent Events (SSE) over HTTP.
- Content-Type: `text/event-stream`.
- Clients must keep the connection open and parse events.

## Event Types
- `message`: final assistant message payload.
- `tool_call`: tool call metadata.
- `tool_result`: tool execution result payload.
- `done`: stream completion marker.
- `error`: error payload with message.

## Event Format
Each event is emitted as:
```
event: <event_name>
data: <json_payload>

```

## Example
```
event: message
data: {"content":"Hello"}

```

## Error Handling
- On error, an `error` event is emitted with `{ "message": "..." }`.
- The stream then ends with `done` or connection close.

## Notes
- The worker proxies the DO response directly; the DO is the source of stream events.
- This contract should be kept stable for clients and tests.
