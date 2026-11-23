# MED™ Automatic Temporary Password Control

TASK-0101 extension.

The existing MED administrator console automatically generates an 18-character temporary password using the browser Web Crypto API (`crypto.getRandomValues`). The password includes uppercase, lowercase, numeric, and symbol characters and avoids visually ambiguous characters.

The administrator can rotate the value with **Generate New Temporary Password** and copy it with **Copy Temporary Password**. If provisioning is started without a visible value, the console generates one automatically before calling the existing protected `/api/med/admin` provisioning endpoint.

After successful authoritative read-back, the temporary password is displayed once for the administrator to copy. MED does not add plaintext password persistence. Supabase Auth receives the password through the existing protected provisioning flow; the Supabase service-role credential remains server-side.
