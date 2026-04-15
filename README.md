# mageperf

**Free, open-source Magento performance analysis CLI by [EaseCloud](https://www.easecloud.io)**

`mageperf` scans any Magento 2 store from your terminal — no account, no cloud, no data leaving your machine. It checks performance, security posture, and configuration best practices, then saves reports locally and optionally opens a browser UI.

---

## Features

- **Magento detection** — fingerprints Magento version, edition, and deployment mode
- **Performance analysis** — Core Web Vitals via Google PageSpeed Insights API (optional)
- **Security checks** — exposed admin paths, debug mode, insecure headers
- **Configuration checks** — caching, JS/CSS merging, CDN, production mode
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

# JSON output (pipe into jq, scripts, AI agents)
mageperf analyze https://your-store.com --format json | jq .overall_score

# List saved reports
mageperf list

# Open the local report UI
mageperf serve
```

---

## Commands

| Command                             | Description                      |
| ----------------------------------- | -------------------------------- |
| `mageperf analyze <url>`            | Run a full analysis              |
| `mageperf list`                     | List saved reports               |
| `mageperf open <id>`                | Open a report in the browser UI  |
| `mageperf serve`                    | Start the local report UI server |
| `mageperf clean`                    | Delete all saved reports         |
| `mageperf config set <key> <value>` | Set a config value               |
| `mageperf config get <key>`         | Get a config value               |

### `analyze` options

| Flag              | Default   | Description                               |
| ----------------- | --------- | ----------------------------------------- |
| `--format`        | `summary` | Output format: `summary`, `json`, `table` |
| `--output <file>` | —         | Write JSON report to a file               |
| `--open`          | off       | Open browser UI after analysis            |
| `--no-pagespeed`  | off       | Skip Google PageSpeed API calls           |

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

Analysis runs in four layers:

1. **Magento detection** — headers, HTML patterns, JS indicators, known paths
2. **Performance** — PageSpeed Insights API (optional) or direct HTTP timing
3. **Security** — admin URL exposure, debug headers, error reporting
4. **Configuration** — caching strategy, JS/CSS bundling, deployment mode

All checks use only publicly available data. No credentials, no admin access required.

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
tests/              pytest test suite (20 tests)
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
