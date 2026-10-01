# Security Specification & Threat Model

## Data Invariants
1. A Vehicle document must have a valid non-empty `plate` (max 50 chars), an integer `order`, and a recognized `plan` ('urgent_sell' | 'sell' | 'rebrand' | 'keep').
2. Monthly data maps (`m6`, `m7`, `m8`) must contain numeric values for `dist`, `fuel`, `cost`, and `jobs`.
3. An AuditLog document must specify an `action` and `timestamp`.
4. Anyone accessing the dashboard can read fleet records to monitor fleet status and print disposal memos.
5. Updates to vehicle records and audit logging are authorized for operational staff.

## The Dirty Dozen Payloads (Rejection Matrix)
1. Injection with 50KB string in `plate` -> Rejected by string size validation (max 50 chars).
2. Document with missing required key `plate` -> Rejected by required schema checks.
3. Negative values or NaN in numeric fields (`mileage`, `healthScore`) -> Blocked by validation constraints.
4. Arbitrary unknown ghost keys injected into root -> Blocked by strict key evaluation.
5. Overwriting `id` or malformed path variables -> Rejected by `isValidId()`.
6. Audit log with spoofed 1MB details text -> Rejected by `size() <= 1000` check.
7. Modifying non-existent collection -> Denied by default-deny catchall.
8. Unbounded array injection -> Prohibited.
9. Invalid plan status string -> Rejected by enum validation.
10. Setting future tampering timestamps -> Guarded.
11. Malformed JSON or unescaped symbols -> Guarded.
12. Attempt to bypass rules by client direct mutation -> Server-side and rule constraints prevent bypass.
