# PostWave IPC Protocol

Desktop UI communicates with the local daemon via **JSON-RPC 2.0** over HTTP.

**Endpoint:** `http://127.0.0.1:{POSTWAVE_IPC_PORT}/rpc`

## Methods

| Method | Params | Result |
|--------|--------|--------|
| `postwave.listPosts` | `{ status?, limit? }` | `{ posts: ScheduledPost[] }` |
| `postwave.schedulePost` | `{ text, scheduledAt?, timezone?, mediaPaths?, status? }` | `{ post: ScheduledPost }` |
| `postwave.cancelPost` | `{ id }` | `{ ok: true }` |
| `postwave.getStatus` | `{}` | `{ connected, username?, nextRunAt?, missedCount? }` |
| `postwave.connectX` | `{}` | `{ authorizeUrl: string }` |
| `postwave.getSettings` | `{}` | `{ timezone, xAccounts }` |
| `postwave.updateSettings` | `{ timezone }` | `{ timezone }` |
| `postwave.bulkCreatePosts` | `{ posts, timezone? }` | `{ posts: ScheduledPost[] }` |
| `postwave.updatePost` | `{ id, text?, scheduledAt?, status?, mediaPaths? }` | `{ post: ScheduledPost }` |
| `postwave.deletePost` | `{ id }` | `{ ok: true }` |
| `postwave.retryPost` | `{ id }` | `{ post: ScheduledPost }` |
| `postwave.uploadImage` | `{ data, mimeType, filename? }` | `{ path: string }` |
| `postwave.disconnectX` | `{}` | `{ ok: true }` |
| `postwave.listMissed` | `{}` | `{ posts: ScheduledPost[] }` |
| `postwave.catchUp` | `{ postIds? }` | `{ published: number }` |

## Example

```json
{"jsonrpc":"2.0","id":1,"method":"postwave.listPosts","params":{"limit":50}}
```

## Errors

| Code | Meaning |
|------|---------|
| -32600 | Invalid request |
| -32601 | Method not found |
| -32602 | Invalid params |
| -32000 | Application error |

`apiVersion: 1` in daemon handshake when implemented.
