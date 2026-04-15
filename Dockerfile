FROM python:3.11-slim

LABEL org.opencontainers.image.title="mageperf"
LABEL org.opencontainers.image.description="EaseCloud Magento Performance Analyzer"
LABEL org.opencontainers.image.source="https://github.com/easecloud/mageperf"
LABEL org.opencontainers.image.vendor="EaseCloud"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy package files
COPY pyproject.toml README.md ./
COPY mageperf/ ./mageperf/

# Install dependencies
RUN pip install --no-cache-dir .

# Create config directory
RUN mkdir -p /root/.easecloud/mageperf/reports

EXPOSE 4780

ENTRYPOINT ["mageperf"]
CMD ["--help"]
