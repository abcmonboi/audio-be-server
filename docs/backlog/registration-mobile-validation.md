# Backlog: registration mobile validation

Status: deferred.

Currently mobile is required and uses only z.string().trim().min(1).max(32).
Phone format validation and E.164 normalization are temporarily disabled.

- Decide whether to accept Vietnamese/international numbers and mobile numbers only.
- Restore validation and E.164 normalization using libphonenumber-js.
- Normalize existing data and resolve duplicates before applying normalization with the mobile unique index.
- Update tests for valid/invalid numbers, the VN default region and normalization.

Install libphonenumber-js when this validation is implemented.
