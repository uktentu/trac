# HabitCommit - Git-Style Habit Tracker

A premium habit tracking application with Git-inspired visualizations and persistent database storage.

## Features

- 📊 **GitHub-Style Contribution Graph** - 365-day heatmap of your habit commitments
- 📈 **Weekly Progress Chart** - Bar chart showing trends over 12 weeks
- 🎯 **Personality Radar Chart** - Discover which days you're most consistent
- 🔥 **Streak Tracking** - Monitor current and longest streaks
- 🎨 **Premium Dark Theme** - Git-themed glassmorphism design
- 💾 **Persistent Database** - Data saved in SQLite, works across browsers

## Tech Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Chart.js for data visualization
- Glassmorphism UI with smooth animations

**Backend:**
- Python Flask REST API
- SQLite database
- CORS-enabled for local development

## Installation

### 1. Prerequisites

- Python 3.7 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### 2. Install Dependencies

```bash
cd /Users/udaykirantentu/Desktop/anti/trac

# Install Python packages
pip install -r requirements.txt
```

### 3. Start the Backend Server

```bash
python server.py
```

You should see:
```
🚀 Starting HabitCommit API Server...
📊 Database: habits.db
🌐 Server: http://localhost:5000
...
```

**Keep this terminal running!**

### 4. Open the Frontend

Open `index.html` in your browser:

```bash
open index.html
```

Or double-click `index.html` in Finder.

## Usage

### Creating Habits

1. Click **"New Habit"** or press `Cmd+N`
2. Enter habit name (e.g., "Morning Workout", "Read 30 Minutes")
3. Choose a color
4. Click "Create Habit"

### Making Commits

1. Click **"Commit Today"** on any habit card
2. Watch your contribution graph update in real-time
3. Build streaks by committing consecutive days
4. Celebrate with confetti at 7, 14, 21-day milestones!

### Analyzing Patterns

- **Contribution Graph**: See your full year of activity
- **Weekly Progress Chart**: Spot trends and improvement
- **Personality Radar**: Identify your strongest days of the week
- **Statistics Dashboard**: Track all your key metrics

## Database

All your data is stored in `habits.db` in the project directory.

### Backup Your Data

Simply copy the `habits.db` file:

```bash
cp habits.db habits_backup_$(date +%Y%m%d).db
```

### View Database (Optional)

```bash
sqlite3 habits.db

# Run queries
SELECT * FROM habits;
SELECT * FROM commits;
```

## API Endpoints

The Flask server provides REST API endpoints:

### Habits
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/<id>` - Update habit
- `DELETE /api/habits/<id>` - Delete habit

### Commits
- `GET /api/commits` - Get all commits  
- `POST /api/commits` - Create new commit

## File Structure

```
trac/
├── index.html          # Frontend UI
├── styles.css          # Styling and animations
├── app.js              # Frontend logic
├── server.py           # Flask API server
├── database.py         # Database operations
├── requirements.txt    # Python dependencies
├── habits.db           # SQLite database (auto-created)
└── README.md           # This file
```

## Troubleshooting

### "Could not connect to database" error

**Problem:** Frontend can't reach the backend server.

**Solution:**
1. Make sure `python server.py` is running
2. Check the terminal for errors
3. Verify server is at `http://localhost:5000`

### Port 5000 already in use

**Problem:** Another application is using port 5000.

**Solution:** 
Edit `server.py` line 127 to use a different port:
```python
app.run(debug=True, port=5001)  # Change to 5001
```

Then update `app.js` line 13:
```javascript
this.API_BASE = 'http://localhost:5001/api';
```

### Database locked error

**Problem:** Multiple processes accessing the database.

**Solution:**
- Close any SQLite browser tools
- Restart the server

## Development

### Running in Debug Mode

The server runs with `debug=True` by default, providing:
- Auto-reload on code changes
- Detailed error messages
- Interactive debugger

### Adding New Features

1. **Backend**: Add routes in `server.py`, database functions in `database.py`
2. **Frontend**: Update `app.js` and `styles.css`
3. **Restart server**: `Ctrl+C` then `python server.py`

## Future Enhancements

- [ ] User authentication
- [ ] Cloud deployment (Heroku/Railway)
- [ ] Mobile app version
- [ ] Data export (CSV/JSON)
- [ ] Habit categories
- [ ] Reminders and notifications
- [ ] Social sharing

## License

MIT License - Feel free to use and modify!

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review the API server logs
3. Inspect browser console for errors

---

**Enjoy building better habits! 🚀**
