# DNS Security Setup — DMARC + SPF Hardening
## timelesshadith.com — Finding H-04

Apply these DNS changes in your Cloudflare DNS dashboard:
**Cloudflare → timelesshadith.com → DNS → Records**

---

## 1. Add DMARC Record

| Type | Name | Content | TTL |
|------|------|---------|-----|
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@timelesshadith.com; pct=100` | Auto |

**What it does:** Instructs mail servers to quarantine emails that fail SPF/DKIM checks.
Start with `p=quarantine` (safe). After 30 days with no issues, upgrade to `p=reject`.

---

## 2. Update SPF Record (change ~all to -all)

Find the existing SPF TXT record on `@` (root domain) and update it:

| Type | Name | Old Content | New Content |
|------|------|-------------|-------------|
| TXT | `@` | `v=spf1 ... ~all` | `v=spf1 include:_spf.google.com -all` |

**What it does:** `-all` (hardfail) rejects all mail from non-authorised senders.
`~all` (softfail) only marks them as suspicious — not strong enough.

---

## 3. Verify (after 24-48 hrs propagation)

Test at: https://mxtoolbox.com/dmarc.aspx
Enter: `timelesshadith.com`

Expected result: DMARC policy found, `p=quarantine`, `rua` configured.

---

## Upgrade Path

After 30 days monitoring the DMARC reports:

```
v=DMARC1; p=reject; rua=mailto:dmarc@timelesshadith.com; pct=100
```

This completely rejects spoofed emails — maximum protection.
