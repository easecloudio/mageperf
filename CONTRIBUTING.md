# Contributing to mageperf

Thank you for your interest in contributing! This guide covers everything you need to get started.

---

## Ways to contribute

- **Bug reports** — open an issue with steps to reproduce
- **Feature requests** — open an issue describing the use case
- **Pull requests** — fixes, new checks, UI improvements, docs

---

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 18+ (only if editing the UI)

### Setup

```bash
git clone https://github.com/easecloudio/mageperf.git
cd mageperf
pip install -e ".[dev]"
```

If `[dev]` extras aren't available yet, install dev deps directly:

```bash
pip install pytest pytest-asyncio pytest-mock
```

### Run tests

```bash
pytest tests/ -v
```

All 20 tests must pass before submitting a PR.

---

## Project structure

```
mageperf/core/      Analysis engine — add new checks here
mageperf/cli.py     CLI commands — add new commands here
mageperf/storage/   Report persistence
mageperf/server/    Local HTTP server
tests/              pytest suite — add tests for every change
ui/src/             Next.js frontend source
```

---

## Adding a new check

1. Add your logic to `mageperf/core/magento_checker.py` or `performance_checker.py`
2. Return a `CheckResult` dataclass with `category`, `score`, `details`, `recommendations`
3. Wire it into `analysis_orchestrator.py`
4. Add at least one test in `tests/`

---

## Pull request guidelines

- Keep PRs focused — one feature or fix per PR
- All tests must pass (`pytest tests/ -v`)
- Follow existing code style (no formatter enforced, just be consistent)
- Update `README.md` if you add a new command or config key

---

## Reporting a vulnerability

Please do **not** open a public issue for security vulnerabilities.  
Email [security@easecloud.io](mailto:security@easecloud.io) instead.

---

## License

By contributing you agree your code will be released under the [MIT License](LICENSE).
