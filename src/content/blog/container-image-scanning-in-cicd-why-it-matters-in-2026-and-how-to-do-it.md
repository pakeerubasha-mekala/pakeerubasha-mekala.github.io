---
title: "Container Image Scanning in CI/CD: Why It Matters in 2026 and How to Do It"
description: "Guide for Container Image Scanning in CI/CD:"
pubDate: 2026-10-09
updatedDate: 2026-10-09
tags:
  - Image
  - Scan
  - Shift Left
draft: false
---

> Container Image Scanning in CI/CD: Why It Matters in 2026 and How to Do It

## 1. What is container image scanning?

A container image is a stack of layers: a base OS, system packages, language dependencies (npm, pip, Maven...) and our application code. Any layer can contain:

| Finding type | Example |
|---|---|
| **OS / package CVEs** | A vulnerable `openssl` or `glibc` in the base image |
| **Language dependency CVEs** | A vulnerable `lodash`, `requests`, `log4j` in `package-lock.json` / `requirements.txt` |
| **Secrets** | An API key or private key accidentally `COPY`'d into a layer |
| **Misconfiguration** | Running as root, no `USER`, `latest` tag, exposed debug ports |
| **License issues** | A GPL component in a proprietary product |

A scanner (Trivy, Grype, Snyk, Docker Scout, AWS ECR / GCP Artifact Registry scanning, etc.) unpacks the image, builds an inventory of what is inside (an SBOM), and matches it against vulnerability databases (NVD, distro advisories, GitHub Advisories, CISA KEV).

---

## 2. Why is it needed in 2026?

1. **Attackers are faster than patch cycles.** Time from CVE publication to active exploitation keeps shrinking, often to days. We can't rely on a quarterly "patch day"; we need to know on every build what we are shipping.
2. **Software supply-chain attacks are now routine.** Compromised npm/PyPI packages, malicious maintainers, and self-propagating package worms have become regular events. Our images pull in hundreds of transitive dependencies we never reviewed by hand.
3. **AI-assisted coding increases dependency churn.** Code assistants add libraries and base images quickly, and can suggest outdated or even non-existent (hallucinated / typosquatted) packages. More code, faster, means more unreviewed surface.
4. **Regulation and customer requirements.** The EU Cyber Resilience Act's vulnerability-reporting obligations start applying in September 2026, with broader obligations following. Clients increasingly ask for SBOMs and evidence of vulnerability management in security questionnaires and contracts. Scan reports plus SBOMs are that evidence.
5. **Images are long-lived.** An image that was clean when built can become vulnerable next week when a new CVE is published. Scanning only at build time isn't enough; we also re-scan what is already in the registry and running.
6. **Shift-left is cheaper.** Fixing a vulnerable base image in a PR takes minutes. Fixing it after it is in production means incident process, hotfixes and downtime.
7. **Cloud and Kubernetes blast radius.** A compromised container with an over-permissive role can reach cloud resources, data stores and other workloads.

**Bottom line:** if an image is built in CI, it should be scanned in CI, and a failed scan should be able to stop a release.

---

## 3. Where scanning fits in the pipeline

```
 Code push / PR
      |
      v
 [1] Lint + unit tests
      |
      v
 [2] Build image            (docker build)
      |
      v
 [3] SCAN image  <------ fail the build on HIGH/CRITICAL (with fixes available)
      |                  also: secrets, misconfig, generate SBOM
      v
 [4] Push to registry       (only if scan passed)
      |
      v
 [5] Sign image + attach SBOM   (cosign)
      |
      v
 [6] Deploy (admission policy: only signed, scanned images)
      |
      v
 [7] Scheduled re-scan of registry / running images (daily)
```

Key principle: **build, scan, then push**. A vulnerable image should never reach the registry that deployments pull from.

---

## 4. Distroless images: the best fix is having less to scan

A **distroless** image contains only your app and its runtime (for example the Python interpreter and its libraries). It has **no shell, no package manager (`apt`/`apk`), and no common OS utilities** (`curl`, `wget`, `bash`, `ls`...).

Why this matters:

| Benefit | Explanation |
|---|---|
| **Far fewer CVEs** | A typical `python:3.12` image ships hundreds of OS packages. Distroless ships a handful. Fewer packages means fewer findings, less noise and less patching. |
| **Smaller attack surface** | If an attacker gets code execution in the container, there is no shell to open and no `curl`/`wget` to download tools or exfiltrate data. This makes post-exploitation much harder. |
| **Smaller and faster** | Smaller images pull faster, start faster and cost less to store. |
| **Cleaner SBOMs** | The SBOM lists only what the app really needs, so audits and client questionnaires are easier. |
| **Nonroot by default** | The `:nonroot` tags run as an unprivileged user (UID 65532). |

Trade-offs to know about:
- **No shell**, so `docker exec -it <c> sh` doesn't work. For debugging use the `:debug` tag locally (it includes busybox), or `kubectl debug` with an ephemeral container. Never ship `:debug` to production.
- **No `curl` in `HEALTHCHECK`**. Use Kubernetes liveness/readiness probes (HTTP or gRPC) instead.
- **Python version and libc must match** between the build stage and the runtime stage, otherwise compiled wheels can fail to load. See the Dockerfile below.
- Scanners still work. They read the package metadata that distroless keeps (dpkg status files) and your Python dependencies.

Alternatives with the same idea: Chainguard images, Docker Hardened Images, Ubuntu Chiseled, `scratch` (for static binaries).

---

## 5. Example: Python Dockerfile (multi-stage + distroless)

```dockerfile
# ---------- Stage 1: build ----------
# Pin by version (ideally by digest). Never use :latest.
# Use the SAME Python minor version as the distroless runtime (Debian 13 = Python 3.13).
FROM python:3.13-slim-trixie AS build

ENV PIP_NO_CACHE_DIR=1 PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /app

# Install dependencies first (better layer caching).
# requirements.txt should be fully pinned, ideally with hashes:
#   pip-compile --generate-hashes requirements.in
COPY requirements.txt .
RUN pip install --require-hashes --target=/app/deps -r requirements.txt

COPY src/ ./src/

# ---------- Stage 2: runtime ----------
# Distroless: no shell, no apt, runs as nonroot (UID 65532)
FROM gcr.io/distroless/python3-debian13:nonroot

WORKDIR /app
COPY --from=build /app/deps ./deps
COPY --from=build /app/src  ./src

ENV PYTHONPATH=/app/deps \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8080
# The distroless python image already uses python3 as ENTRYPOINT,
# so CMD is just the script to run.
CMD ["src/main.py"]
```

Example `.dockerignore` (so secrets and junk never enter the build context):

```
.git
.env
.env.*
*.pem
*.key
__pycache__/
.venv/
tests/
```

Example `requirements.txt` (dummy, pinned):

```
fastapi==0.115.0
uvicorn==0.30.6
pydantic==2.9.2
```

Tips that reduce findings before the scanner even runs:
- Multi-stage builds, so compilers and build tools don't ship in the runtime image.
- Distroless (or at least `-slim`) bases.
- Pin versions and hashes. Rebuild regularly to pick up patched base layers.
- Never `COPY` `.env` files. Always keep a `.dockerignore`.

---

## 6. Improvements needed: what we should do as a team

This is the full list of improvements we want across our pipelines, roughly in priority order.

### A. Image and Dockerfile hardening
- [ ] Move from full OS images (`python:3.x`) to **distroless** (or `-slim` as a stepping stone).
- [ ] Use **multi-stage builds**; no compilers, `pip`, `git` or build tools in the runtime image.
- [ ] **Pin base images** by version, preferably by digest (`@sha256:...`). No `:latest`.
- [ ] Run as **non-root** (`USER nonroot` / `:nonroot` tag).
- [ ] Add a `.dockerignore` and never bake secrets or `.env` files into layers. Use runtime secrets (Secrets Manager, Vault, K8s secrets).
- [ ] Use a **read-only root filesystem**, drop all Linux capabilities and disable privilege escalation at deploy time (`securityContext`).
- [ ] Don't expose unnecessary ports; no debug tools or `:debug` tags in production.

### B. Dependency hygiene (Python)
- [ ] Pin all dependencies (lockfile) and install with `--require-hashes`.
- [ ] Use a private/trusted index or proxy; guard against typosquatting and dependency confusion.
- [ ] Review any new package added by an AI assistant: does it exist, is it maintained, is it the intended name?
- [ ] Run `pip-audit` (or equivalent) in CI alongside the image scan, since it catches dependency issues earlier and with clearer output.
- [ ] Enable Dependabot/Renovate so base images and dependencies are bumped automatically via PRs.

### C. CI/CD pipeline
- [ ] Scan on **every PR and every merge to main**, not just releases.
- [ ] **Build, scan, then push.** Never push before the gate passes.
- [ ] **Fail the build** on fixable HIGH/CRITICAL findings (`exit-code: 1`). Report-only mode is a temporary step.
- [ ] Scan for **secrets and misconfigurations**, not just CVEs (`scanners: vuln,secret,misconfig`).
- [ ] Scan **IaC / Helm / Kubernetes manifests** (`trivy config`) too.
- [ ] Upload **SARIF** to the GitHub Security tab so findings are visible and tracked.
- [ ] Generate an **SBOM** (CycloneDX/SPDX) for each build and store it with the release.
- [ ] **Pin third-party actions** to a commit SHA, and use least-privilege `permissions:` in workflows.
- [ ] Use **OIDC / short-lived credentials** to authenticate to the registry and cloud. No long-lived keys in CI.
- [ ] Cache the scanner vulnerability DB to keep builds fast and avoid rate limits.

### D. Registry, signing and runtime
- [ ] **Sign images** (cosign) and attach SBOM attestations.
- [ ] Enforce in the cluster (admission controller such as Kyverno / OPA Gatekeeper / Binary Authorization): **only signed images from our registry may run**.
- [ ] Enable **continuous registry scanning** (ECR / Artifact Registry) plus a **nightly re-scan** job.
- [ ] Set **image retention / cleanup** policies so stale vulnerable images don't linger.
- [ ] Optional: runtime monitoring (Falco, GuardDuty, etc.) for the cases scanning can't catch.

### E. Process and ownership
- [ ] Define **SLAs** for fixing findings (example: CRITICAL 7 days, HIGH 30 days, MEDIUM 90 days; agree on our own).
- [ ] Name an **owner** for triaging scan results in each repo/team.
- [ ] Every `.trivyignore` exception needs a **ticket, an owner and an expiry date**. Review them in PRs.
- [ ] Prioritise by exploitability: **CISA KEV** and **EPSS** score, not CVSS alone.
- [ ] Alert (Slack/Teams/email) when the nightly scan fails.
- [ ] Track metrics: number of open CRITICAL/HIGH, mean time to remediate, % of images distroless, % of images signed.
- [ ] Keep SBOMs and scan reports as audit evidence for clients and compliance (CRA and similar).

---

## 7. Example: GitHub Actions workflow (Trivy)

`.github/workflows/container-scan.yml`

```yaml
name: container-scan

on:
  pull_request:
  push:
    branches: [main]
  schedule:
    - cron: "0 3 * * *"   # nightly re-scan: new CVEs appear after build

permissions:
  contents: read
  security-events: write   # upload SARIF to the Security tab

env:
  IMAGE: my-registry.example.com/my-team/my-app
  TAG: ${{ github.sha }}

jobs:
  build-and-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4   # pin to a commit SHA in real pipelines

      - name: Build image (not pushed yet)
        run: docker build -t "$IMAGE:$TAG" .

      # 1) Gate: fail the pipeline on fixable HIGH/CRITICAL vulnerabilities
      - name: Scan image (gate)
        uses: aquasecurity/trivy-action@master   # pin to a released version/SHA
        with:
          image-ref: ${{ env.IMAGE }}:${{ env.TAG }}
          scanners: vuln,secret,misconfig
          severity: HIGH,CRITICAL
          ignore-unfixed: true      # only fail on issues that have a fix
          exit-code: "1"            # non-zero exit = pipeline fails
          trivyignores: .trivyignore

      # 2) Report: always produce SARIF so findings show in GitHub Security tab
      - name: Scan image (report)
        if: always()
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.IMAGE }}:${{ env.TAG }}
          format: sarif
          output: trivy-results.sarif
          severity: LOW,MEDIUM,HIGH,CRITICAL

      - name: Upload SARIF
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-results.sarif

      # 3) SBOM: inventory of everything inside the image
      - name: Generate SBOM (CycloneDX)
        run: |
          trivy image --format cyclonedx \
            --output sbom.cdx.json "$IMAGE:$TAG"

      - name: Upload SBOM artifact
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.cdx.json

      # 4) Push only if everything above passed
      - name: Push image
        if: github.ref == 'refs/heads/main'
        run: docker push "$IMAGE:$TAG"
        # Registry login via OIDC / short-lived credentials, never hardcoded secrets
```

### Equivalent one-liners (run locally before pushing)

```bash
# Scan a local image, fail on fixable HIGH/CRITICAL
trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 my-app:dev

# Scan a Dockerfile / IaC for misconfigurations
trivy config .

# Scan the repo's dependencies and secrets before even building
trivy fs --scanners vuln,secret .
```

---

## 8. Example: handling accepted risks (`.trivyignore`)

Sometimes a finding can't be fixed immediately (no patch, or not reachable). Record it explicitly, with an owner and an expiry, instead of disabling the scan.

```
# .trivyignore
# CVE-ID            expiry date           reason / ticket
CVE-2025-00000 exp:2026-12-31   # DUMMY: not reachable, no fix upstream. JIRA-1234, owner: @team-lead
```

Rules of thumb:
- Every ignore needs a **ticket, an owner and an expiry date**.
- Review ignores in PRs like code.
- Never ignore a CRITICAL that is in CISA KEV (known exploited) without security sign-off.

---

## 9. Example: policy gate (what should fail the build?)

A simple starting policy. Tune it with your security team.

| Severity | Fix available | Action |
|---|---|---|
| CRITICAL | yes | **Block** the build/release |
| HIGH | yes | **Block** the build/release |
| CRITICAL/HIGH | no | Warn, track in ticket, set ignore with expiry |
| MEDIUM/LOW | any | Report only, fix in regular maintenance |
| Secret detected | n/a | **Block** and rotate the secret immediately |
| Runs as root / `latest` tag | n/a | Warn now, block later once the team is ready |

---

## 10. Example: sign the image and attach the SBOM (optional but recommended)

```bash
# Keyless signing in CI (uses the pipeline's OIDC identity)
cosign sign "$IMAGE@$DIGEST"

# Attach the SBOM as an attestation
cosign attest --predicate sbom.cdx.json --type cyclonedx "$IMAGE@$DIGEST"

# At deploy time, verify before running (can be enforced by a K8s admission policy)
cosign verify "$IMAGE@$DIGEST" \
  --certificate-identity-regexp "https://github.com/my-org/my-app/.*" \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

---

## 11. Example: scheduled re-scan of the registry

New CVEs are published daily, so yesterday's clean image can be vulnerable today. The `schedule` trigger in the workflow above re-scans on a cron. A minimal standalone version:

```yaml
name: nightly-registry-scan
on:
  schedule:
    - cron: "0 2 * * *"
jobs:
  rescan:
    runs-on: ubuntu-latest
    steps:
      - uses: aquasecurity/trivy-action@master   # pin in real use
        with:
          image-ref: my-registry.example.com/my-team/my-app:prod
          severity: HIGH,CRITICAL
          ignore-unfixed: true
          exit-code: "1"    # failed job = notification to the team
```

Also enable your registry's native scanning (ECR / Artifact Registry) for continuous scanning of stored images.

---

## 12. Working with scan results: a simple triage flow

1. **Is there a fix?** Update the package or base image version and rebuild.
2. **Is it in the base image?** Bump the base tag, or switch to a smaller / distroless image.
3. **Is it a transitive dependency?** Upgrade the parent dependency or use overrides/resolutions.
4. **No fix yet?** Check exploitability (CISA KEV, EPSS) and reachability. Add a time-boxed `.trivyignore` entry with a ticket.
5. **False positive?** Document why, and ignore with an expiry.

---

## 13. Common pitfalls

- Scanning only at build time, never again.
- Using `latest` tags, so builds aren't reproducible and scan results can't be tied to an image.
- Setting `exit-code: 0` forever ("report only"). Nobody acts on reports that don't block anything.
- Ignoring findings without an owner or expiry date.
- Pushing the image before scanning.
- Putting registry or API credentials in the workflow file. Use OIDC or the CI secret store.
- Treating the scanner as the whole security story. It complements dependency pinning, least-privilege runtime, network policies and secrets management.

---

## 14. Adoption checklist for a new repo

- [ ] Dockerfile uses a pinned, minimal base image and a non-root `USER`
- [ ] `.dockerignore` excludes `.env`, `.git`, local config
- [ ] CI workflow builds, **scans**, then pushes
- [ ] Gate set to fail on fixable HIGH/CRITICAL
- [ ] SARIF uploaded to the Security tab
- [ ] SBOM generated and stored as an artifact
- [ ] `.trivyignore` entries all have ticket + owner + expiry
- [ ] Nightly re-scan scheduled
- [ ] Image signing and deploy-time verification (next step)
- [ ] Team knows who triages findings and within what SLA (e.g., CRITICAL: 7 days, HIGH: 30 days; agree on your own)

---

## 15. Useful links

- Trivy docs: https://trivy.dev
- Grype / Syft (alternative scanner + SBOM): https://github.com/anchore/grype
- Sigstore / cosign: https://docs.sigstore.dev
- CISA Known Exploited Vulnerabilities catalog: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- OWASP Docker Security Cheat Sheet: https://cheatsheetseries.owasp.org

## 16. Questions / ownership

Add your team's contact channel and owner here: `<team-channel>` / `<owner>`.

```

