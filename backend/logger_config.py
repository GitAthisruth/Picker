import logging
import os

# Create logs directory if it doesn't exist
if not os.path.exists("logs"):
    os.makedirs("logs")

# Configure logger
logger = logging.getLogger("picker")
logger.setLevel(logging.DEBUG)

# File handler
file_handler = logging.FileHandler("logs/app.log")
file_handler.setLevel(logging.DEBUG)

# Console handler (for real-time debugging)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter(
    "%(asctime)s - %(levelname)s - %(message)s [in %(filename)s:%(lineno)d]"
)
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# Add handlers
logger.addHandler(file_handler)
logger.addHandler(console_handler)
