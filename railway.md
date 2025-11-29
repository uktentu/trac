# Railway.app specific configuration

# Build command
# Railway will automatically run: pip install -r requirements.txt

# Start command (defined in Procfile)
# web: python server.py

# Environment Variables needed:
# PORT - automatically provided by Railway
# DATABASE_PATH - optional, defaults to habits.db

# Database persistence:
# Add a Railway volume to persist the SQLite database
# Or upgrade to PostgreSQL for production use
