import logging
import sys

def setup_logger(name: str = "mageperf") -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.WARNING)  # Silent by default in CLI
    if not logger.hasHandlers():
        handler = logging.StreamHandler(sys.stderr)
        handler.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))
        logger.addHandler(handler)
    logger.propagate = False
    return logger

logger = setup_logger()
