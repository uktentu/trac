import sqlite3
import os
from datetime import datetime

# Use Railway's persistent volume if available, otherwise use local path
DATABASE_PATH = os.environ.get('DATABASE_PATH', 'habits.db')

def get_db_connection():
    """Create and return a database connection."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn

def init_database():
    """Initialize the database with required tables."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create habits table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS habits (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create commits table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS commits (
            id TEXT PRIMARY KEY,
            habit_id TEXT NOT NULL,
            date TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
            UNIQUE(habit_id, date)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")

def dict_from_row(row):
    """Convert sqlite3.Row to dictionary."""
    return dict(row) if row else None

# Habit CRUD operations
def get_all_habits():
    """Get all habits from database."""
    conn = get_db_connection()
    habits = conn.execute('SELECT * FROM habits ORDER BY created_at').fetchall()
    conn.close()
    return [dict(habit) for habit in habits]

def get_habit_by_id(habit_id):
    """Get a single habit by ID."""
    conn = get_db_connection()
    habit = conn.execute('SELECT * FROM habits WHERE id = ?', (habit_id,)).fetchone()
    conn.close()
    return dict_from_row(habit)

def create_habit(habit_data):
    """Create a new habit."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO habits (id, name, color, created_at) VALUES (?, ?, ?, ?)',
        (habit_data['id'], habit_data['name'], habit_data['color'], habit_data['createdAt'])
    )
    
    conn.commit()
    conn.close()
    return habit_data

def update_habit(habit_id, habit_data):
    """Update an existing habit."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        'UPDATE habits SET name = ?, color = ? WHERE id = ?',
        (habit_data['name'], habit_data['color'], habit_id)
    )
    
    conn.commit()
    conn.close()
    return get_habit_by_id(habit_id)

def delete_habit(habit_id):
    """Delete a habit and all its commits."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Foreign key cascade will automatically delete related commits
    cursor.execute('DELETE FROM habits WHERE id = ?', (habit_id,))
    
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

# Commit CRUD operations
def get_all_commits():
    """Get all commits from database."""
    conn = get_db_connection()
    commits = conn.execute('SELECT * FROM commits ORDER BY timestamp DESC').fetchall()
    conn.close()
    return [dict(commit) for commit in commits]

def get_commits_by_habit(habit_id):
    """Get all commits for a specific habit."""
    conn = get_db_connection()
    commits = conn.execute(
        'SELECT * FROM commits WHERE habit_id = ? ORDER BY date DESC',
        (habit_id,)
    ).fetchall()
    conn.close()
    return [dict(commit) for commit in commits]

def create_commit(commit_data):
    """Create a new commit."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'INSERT INTO commits (id, habit_id, date, timestamp) VALUES (?, ?, ?, ?)',
            (commit_data['id'], commit_data['habitId'], commit_data['date'], commit_data['timestamp'])
        )
        conn.commit()
        result = commit_data
    except sqlite3.IntegrityError:
        # Duplicate commit on same day
        result = None
    finally:
        conn.close()
    
    return result

def get_commits_for_today(date_str):
    """Get all commits for a specific date."""
    conn = get_db_connection()
    commits = conn.execute(
        'SELECT * FROM commits WHERE date = ?',
        (date_str,)
    ).fetchall()
    conn.close()
    return [dict(commit) for commit in commits]

# Initialize database on module import
if __name__ == '__main__':
    init_database()
