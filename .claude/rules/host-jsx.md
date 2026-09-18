---
paths:
  - "public/jsx/**"
---

# Host script rules

- The namespace is rebuilt on every load so that deleted functions stop being callable without
  restarting AE. Keep it that way.
- Never call `alert()` or `confirm()`: they block AE's scripting engine. Queue messages with
  `report()` and the panel shows them as toasts. Confirmations happen in the panel through
  `useConfirm`.
- Nothing may touch the project outside an undo group, not even to ask a question. Close undo
  groups in `finally`, exactly once, even when something above throws.
- Before probing by creating items, check whether `app.effects` already answers.
  `getTwixtorInfo()` used to create a comp and a solid, which marked the project as modified
  and left an empty "Solids" folder (`addSolid` creates it when missing).
- Read `app.effects` once into a variable and loop over the copy, as
  `twixtorMightBeInstalled()` does. Every access rebuilds the whole list (200 ms with about
  1,400 effects in AE 2026), so `app.effects[i]` or `.length` inside a loop leaves AE
  "Not Responding" for minutes.
