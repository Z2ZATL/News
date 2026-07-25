# ADR 0005: CNAME and subdomain mail policy

Status: Accepted

## Context

Build Plan v3 asked for `news.z2zs.space` and `studio.z2zs.space` to be CNAMEs
to the application host while also publishing a null MX and `v=spf1 -all` at
those same owner names. Those records cannot coexist. RFC 1034 section 3.6.2
states that a DNS node containing a CNAME must not contain other data.

The two application hostnames do not send legitimate mail. The apex domain,
however, sends mail through Google Workspace, and `brief.z2zs.space` has an
independent sending integration. The apex DMARC policy must therefore remain in
monitoring until all legitimate senders are verified.

## Decision

- Keep `news.z2zs.space` and `studio.z2zs.space` as DNS-only CNAMEs to their
  approved application hosts.
- Do not publish MX, SPF TXT, or any other data at either CNAME owner name.
- Publish an explicit DMARC record for each non-sending application subdomain
  at `_dmarc.news.z2zs.space` and `_dmarc.studio.z2zs.space` after the exact DNS
  mutation is approved:

  ```dns
  _dmarc.news.z2zs.space.   TXT "v=DMARC1; p=reject; rua=mailto:mori@z2zs.space"
  _dmarc.studio.z2zs.space. TXT "v=DMARC1; p=reject; rua=mailto:mori@z2zs.space"
  ```

- Keep `_dmarc.z2zs.space` at `p=none; sp=none` during the reporting phase.
  Tighten the organizational policy only after Google Workspace and every
  `brief` sender pass aligned SPF or DKIM.
- Never apply a null MX, `v=spf1 -all`, or wildcard DKIM revocation at the apex
  or to `brief.z2zs.space`.
- If a future requirement makes null MX mandatory for either application
  hostname, replace its CNAME with a hosting design that supports stable A/AAAA
  records before adding the null MX. Do not create an invalid mixed record set.

## Consequences

- Exact subdomain DMARC records can reject spoofed visible From addresses for
  the application hostnames without changing the apex or `brief` policy.
- A CNAME cannot advertise null MX or SPF at the same owner name. DMARC protects
  sender identity but does not advertise that the hostname rejects inbound
  SMTP, so this is a deliberate standards-compliant tradeoff.
- Every DNS change remains a separate production mutation requiring a read-only
  target check and explicit founder authorization.

## References

- RFC 1034 section 3.6.2: https://www.rfc-editor.org/rfc/rfc1034#section-3.6.2
- RFC 7489 sections 6.1 and B.2.4: https://www.rfc-editor.org/rfc/rfc7489
- RFC 7505 sections 3 and 4.2: https://www.rfc-editor.org/rfc/rfc7505
