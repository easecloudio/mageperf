# mageperf

**Free, open-source Magento performance analysis CLI by [EaseCloud](https://www.easecloud.io)**

`mageperf` scans any Magento 2 store from your terminal — no account, no cloud, no data leaving your machine. It checks performance, security posture, and configuration best practices, then saves reports locally and optionally opens a browser UI.

---

## Features

- **Magento detection** — fingerprints Magento version, edition, and deployment mode; `--force` overrides for hardened stores
- **Performance analysis** — Core Web Vitals via Google PageSpeed Insights API (optional)
- **Security checks** — exposed admin paths, debug mode, insecure headers
- **Configuration checks** — caching, JS/CSS merging, CDN, production mode
- **Search engine detection** — flags likely MySQL search engine usage (critical performance issue on large catalogs)
- **Extension audit** — 25+ known performance-heavy extensions flagged with actionable guidance
- **Report comparison** — diff two reports to measure improvement: `mageperf compare <before> <after>`
- **Selective analysis** — `--checks magento` or `--checks performance` to run subsets
- **Local reports** — stored in `~/.easecloud/mageperf/reports/` as JSON
- **Browser UI** — rich report viewer served locally on port 4780
- **JSON output** — pipe results into scripts or AI agents

---

## Installation

### pip (recommended)

```bash
pip install easecloud-mageperf
```

### npm / npx

```bash
npx @easecloud/mageperf analyze https://your-store.com
# or install globally
npm install -g @easecloud/mageperf
```

### Docker

```bash
docker run --rm easecloud/mageperf analyze https://your-store.com
```

### One-line install script

```bash
curl -fsSL https://raw.githubusercontent.com/easecloudio/mageperf/main/install.sh | bash
```

---

## Quick start

```bash
# Analyze a store
mageperf analyze https://your-store.com

# Analyze and open the browser UI when done
mageperf analyze https://your-store.com --open

# Force analysis when Magento fingerprints are hardened
mageperf analyze https://your-store.com --force

# Run only performance checks (skip Magento config/security)
mageperf analyze https://your-store.com --checks performance

# JSON output (pipe into jq, scripts, AI agents)
mageperf analyze https://your-store.com --format json | jq .overall_score

# List saved reports (numbered for easy reference)
mageperf list

# Open report by number from the list
mageperf open 1

# Compare two reports to measure improvement
mageperf compare <before-id> <after-id>

# Open the local report UI
mageperf serve
```

---

## Commands

| Command                              | Description                                          |
| ------------------------------------ | ---------------------------------------------------- |
| `mageperf analyze <url>`             | Run a full analysis                                  |
| `mageperf list`                      | List saved reports (numbered)                        |
| `mageperf open <id\|number>`         | Open a report in the browser UI (UUID or list index) |
| `mageperf compare <id1> <id2>`       | Diff two reports: score delta, resolved findings     |
| `mageperf serve`                     | Start the local report UI server                     |
| `mageperf delete <id>`               | Delete a single report                               |
| `mageperf clean`                     | Delete all saved reports                             |
| `mageperf config set <key> <value>`  | Set a config value                                   |
| `mageperf config get <key>`          | Get a config value                                   |

### `analyze` options

| Flag                | Default   | Description                                              |
| ------------------- | --------- | -------------------------------------------------------- |
| `--format`          | `summary` | Output format: `summary`, `json`, `table`                |
| `--output <file>`   | —         | Write JSON report to a file                              |
| `--open`            | off       | Open browser UI after analysis                           |
| `--no-pagespeed`    | off       | Skip Google PageSpeed API calls                          |
| `--force`           | off       | Skip Magento detection gate (for hardened stores)        |
| `--checks <subset>` | `all`     | Comma-separated checks to run: `performance`, `magento`, `all` |
| `--timeout <secs>`  | 20        | HTTP request timeout in seconds                          |

---

## Configuration

Config is stored in `~/.easecloud/mageperf/config.json`.

```bash
# Set your Google PageSpeed API key (optional, improves accuracy)
mageperf config set pagespeed-api-key YOUR_KEY

# Change the local UI port (default: 4780)
mageperf config set server-port 4780
```

Get a free PageSpeed API key at [Google Cloud Console](https://console.cloud.google.com/).  
Without a key, `mageperf` falls back to direct HTTP analysis.

---

## How it works

Analysis runs in five layers:

1. **Magento detection** — headers, HTML patterns, JS indicators, known paths; `--force` bypasses if the store hardens its fingerprint
2. **Performance** — PageSpeed Insights API (optional) or direct HTTP timing
3. **Security** — admin URL exposure, debug headers, error reporting
4. **Configuration** — caching strategy, JS/CSS bundling, deployment mode
5. **Search engine** — detects likely MySQL catalog search via response timing and headers; flags it as a critical finding on large catalogs

All checks use only publicly available data. No credentials, no admin access required.

Any check that fails (timeout, connection error) surfaces in the terminal output with its error message rather than silently defaulting to zero.

---

## Output example

```
Overall Score: 74/100

  Performance   82  ████████░░
  Security      61  ██████░░░░
  Config        79  ███████░░░

2 critical issues found. Run with --open to view full report.
Report saved: ~/.easecloud/mageperf/reports/abc123.json
```

**Comparing two reports:**

```
$ mageperf compare <before-id> <after-id>

Score Comparison
  Baseline : https://store.com  [2026-04-01]  score=55  grade=C
  Compared : https://store.com  [2026-04-14]  score=74  grade=B

 Category      Before  After  Delta
 Overall          55     74   +19
 Performance      50     82   +32
 Security         60     61    +1
 Config           55     79   +24

Resolved (1):
  ✓ Enable CSS merging
```

> **Found critical issues?** EaseCloud provides [Magento performance optimization consulting](https://www.easecloud.io/magento-performance-optimization) — Core Web Vitals, caching strategy, infrastructure tuning, and more.

---

## Development

```bash
git clone https://github.com/easecloudio/mageperf.git
cd mageperf
pip install -e ".[dev]"

# Run tests
pytest tests/ -v

# Build the UI (requires Node 18+)
cd ui && npm install && npm run build
```

### Project structure

```
mageperf/           Python package
  cli.py            Typer CLI entry point
  config.py         Config management (~/.easecloud/mageperf/)
  core/             Analysis engine
    magento_checker.py
    performance_checker.py
    analysis_orchestrator.py
    scoring_service.py
  storage/          Local JSON report store
  server/           stdlib HTTP server + pre-built UI
    static/         Pre-built Next.js UI
tests/              pytest test suite (73 tests)
ui/                 Next.js 15 UI source (TypeScript)
Dockerfile          Docker image build
install.sh          Universal install script
package.json        npm wrapper (@easecloud/mageperf)
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Work with EaseCloud

`mageperf` finds the problems. Need help fixing them?

We offer end-to-end [Magento performance optimization](https://www.easecloud.io/magento-performance-optimization) — from diagnosis to implementation across caching, Core Web Vitals, infrastructure, and deployment.

Contact: [support@easecloud.io](mailto:support@easecloud.io) · [easecloud.io](https://easecloud.io)

---

## License

MIT © [EaseCloud](https://easecloud.io)
