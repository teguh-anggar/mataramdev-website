# Security Policy

## Supported Versions

The following table shows which versions of the project currently receive security updates.

| Version | Supported |
|---------|-----------|
| main    | Yes       |

---

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please do **not** open a public GitHub issue. Public disclosure before a fix is available puts all users at risk.

Instead, report it privately using one of the following methods:

**Email:** contact@mataramdev.org  
**Subject line:** `[SECURITY] Brief description of the vulnerability`

### What to include in your report

- A clear description of the vulnerability and its potential impact
- Steps to reproduce the issue
- Any relevant screenshots, logs, or proof-of-concept code
- Your preferred contact method for follow-up

---

## Response Timeline

| Stage                    | Target Time  |
|--------------------------|--------------|
| Initial acknowledgement  | Within 48 hours |
| Triage and assessment    | Within 5 business days |
| Fix or mitigation        | Dependent on severity |
| Public disclosure        | After fix is deployed |

We will keep you informed at each stage of the process.

---

## Scope

This policy covers the following:

- The `mataramdev-website` source code in this repository
- Client-side JavaScript logic
- Environment variable handling and Supabase integration

The following are out of scope:

- Third-party services (Supabase, Google Fonts, Shields.io)
- Infrastructure not managed by this repository
- Vulnerabilities in dependencies that have no available fix upstream

---

## Disclosure Policy

We follow a coordinated disclosure approach. Once a fix is in place and deployed, we will publish a summary of the vulnerability, its impact, and the corrective action taken. Credit will be given to the reporter unless they prefer to remain anonymous.

---

## Security Best Practices for Contributors

- Never commit credentials, API keys, or secrets. Use `.env` and ensure it is listed in `.gitignore`.
- Validate and sanitize all user input before sending it to any backend or third-party service.
- Keep dependencies minimal; review any third-party scripts included in the project.
- Follow the principle of least privilege when configuring Supabase row-level security (RLS) policies.
