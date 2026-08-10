# Security Proposals — Not Migrations

Files here are review material and are not executed by Supabase migration tooling. The public-write proposal ends in `ROLLBACK` as an additional guard, but review—not that guard—is the control boundary.

Before promotion, humans must decide anonymous read needs; row ownership and role storage; contributor/editor/reviewer/publisher/administrator boundaries; service identity scope; grants; audit attribution; and rollback/lockout handling. No repository evidence currently supports encoding those business permissions as authoritative.
