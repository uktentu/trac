// HabitCommit - Git-Style Habit Tracker
// Data structure and state management

class HabitTracker {
    constructor() {
        this.habits = [];
        this.commits = [];
        this.currentHabit = null;
        this.selectedColor = '#22c55e';
        this.currentFilter = 'all';
        this.weeklyProgressChart = null;
        this.personalityRadarChart = null;
        // Use production backend URL - change to localhost:5001 for local development
        this.API_BASE = 'https://trac-production.up.railway.app/api';
        this.init();
    }

    async init() {
        this.cacheDOMElements();
        this.attachEventListeners();
        await this.loadData();
        this.render();
    }

    cacheDOMElements() {
        // Modal elements
        this.modal = document.getElementById('habitModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.habitNameInput = document.getElementById('habitName');
        this.colorPicker = document.getElementById('colorPicker');
        this.saveBtn = document.getElementById('saveHabitBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.modalClose = document.getElementById('modalClose');

        // Habit elements
        this.habitsGrid = document.getElementById('habitsGrid');
        this.emptyState = document.getElementById('emptyState');
        this.addHabitBtn = document.getElementById('addHabitBtn');
        this.emptyAddHabitBtn = document.getElementById('emptyAddHabitBtn');

        // Stats elements
        this.totalCommitsEl = document.getElementById('totalCommits');
        this.currentStreakEl = document.getElementById('currentStreak');
        this.longestStreakEl = document.getElementById('longestStreak');
        this.totalHabitsEl = document.getElementById('totalHabits');
        this.completionRateEl = document.getElementById('completionRate');
        this.todayCommitsEl = document.getElementById('todayCommits');

        // Graph elements
        this.contributionGraph = document.getElementById('contributionGraph');
        this.contributionMonths = document.getElementById('contributionMonths');
        this.filterTabs = document.getElementById('filterTabs');

        // History elements
        this.historyList = document.getElementById('historyList');
        this.emptyHistory = document.getElementById('emptyHistory');

        // Confetti canvas
        this.confettiCanvas = document.getElementById('confettiCanvas');
        this.confettiCtx = this.confettiCanvas.getContext('2d');

        // Chart canvases
        this.weeklyProgressCanvas = document.getElementById('weeklyProgressChart');
        this.personalityRadarCanvas = document.getElementById('personalityRadarChart');
    }

    attachEventListeners() {
        // Add habit buttons
        this.addHabitBtn.addEventListener('click', () => this.openModal());
        this.emptyAddHabitBtn.addEventListener('click', () => this.openModal());

        // Modal actions
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.saveBtn.addEventListener('click', async () => await this.saveHabit());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Color picker
        this.colorPicker.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-option')) {
                this.selectColor(e.target);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                e.preventDefault();
                this.openModal();
            }
        });
    }

    // Data persistence with API
    async loadData() {
        try {
            // Load habits
            const habitsResponse = await fetch(`${this.API_BASE}/habits`);
            this.habits = await habitsResponse.json();

            // Load commits
            const commitsResponse = await fetch(`${this.API_BASE}/commits`);
            this.commits = await commitsResponse.json();

            console.log('✅ Data loaded from database');
        } catch (error) {
            console.error('❌ Error loading data from API:', error);
            alert('Could not connect to database. Make sure the server is running:\n\npython server.py');
            this.habits = [];
            this.commits = [];
        }
    }

    async saveHabitToAPI(habit) {
        const response = await fetch(`${this.API_BASE}/habits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(habit)
        });
        return await response.json();
    }

    async updateHabitInAPI(habitId, habitData) {
        const response = await fetch(`${this.API_BASE}/habits/${habitId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(habitData)
        });
        return await response.json();
    }

    async deleteHabitFromAPI(habitId) {
        const response = await fetch(`${this.API_BASE}/habits/${habitId}`, {
            method: 'DELETE'
        });
        return await response.json();
    }

    async saveCommitToAPI(commit) {
        const response = await fetch(`${this.API_BASE}/commits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commit)
        });
        if (response.status === 409) {
            return null; // Duplicate commit
        }
        return await response.json();
    }

    // Modal management
    openModal(habit = null) {
        this.currentHabit = habit;
        this.modal.classList.add('active');

        if (habit) {
            this.modalTitle.textContent = 'Edit Habit';
            this.habitNameInput.value = habit.name;
            this.selectedColor = habit.color;
            this.saveBtn.textContent = 'Save Changes';
        } else {
            this.modalTitle.textContent = 'Create New Habit';
            this.habitNameInput.value = '';
            this.selectedColor = '#22c55e';
            this.saveBtn.textContent = 'Create Habit';
        }

        // Update color picker
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.color === this.selectedColor);
        });

        setTimeout(() => this.habitNameInput.focus(), 100);
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.currentHabit = null;
    }

    selectColor(colorBtn) {
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.classList.remove('selected');
        });
        colorBtn.classList.add('selected');
        this.selectedColor = colorBtn.dataset.color;
    }

    // Habit CRUD operations
    async saveHabit() {
        const name = this.habitNameInput.value.trim();

        if (!name) {
            this.habitNameInput.focus();
            return;
        }

        try {
            if (this.currentHabit) {
                // Edit existing habit
                await this.updateHabitInAPI(this.currentHabit.id, {
                    name,
                    color: this.selectedColor
                });

                // Update local copy
                this.currentHabit.name = name;
                this.currentHabit.color = this.selectedColor;
            } else {
                // Create new habit
                const habit = {
                    id: Date.now().toString(),
                    name,
                    color: this.selectedColor,
                    createdAt: new Date().toISOString()
                };

                await this.saveHabitToAPI(habit);
                this.habits.push(habit);
            }

            this.closeModal();
            await this.loadData(); // Reload from server
            this.render();
        } catch (error) {
            console.error('Error saving habit:', error);
            alert('Failed to save habit. Please try again.');
        }
    }

    async deleteHabit(habitId) {
        if (!confirm('Are you sure you want to delete this habit? All commit history will be lost.')) {
            return;
        }

        try {
            await this.deleteHabitFromAPI(habitId);

            // Update local copies
            this.habits = this.habits.filter(h => h.id !== habitId);
            this.commits = this.commits.filter(c => c.habitId !== habitId);

            this.render();
        } catch (error) {
            console.error('Error deleting habit:', error);
            alert('Failed to delete habit. Please try again.');
        }
    }

    // Commit management
    async commitHabit(habitId) {
        const today = this.getDateString(new Date());
        const existingCommit = this.commits.find(
            c => c.habitId === habitId && c.date === today
        );

        if (existingCommit) {
            return; // Already committed today
        }

        const commit = {
            id: Date.now().toString(),
            habitId,
            date: today,
            timestamp: new Date().toISOString()
        };

        try {
            const savedCommit = await this.saveCommitToAPI(commit);

            if (savedCommit) {
                this.commits.push(commit);

                // Check for streak milestones
                const streak = this.calculateStreak(habitId);
                if (streak % 7 === 0 && streak > 0) {
                    this.celebrateStreak(streak);
                }

                this.render();
            }
        } catch (error) {
            console.error('Error saving commit:', error);
            alert('Failed to save commit. Please try again.');
        }
    }

    // Date utilities
    getDateString(date) {
        return date.toISOString().split('T')[0];
    }

    getDaysArray(days) {
        const dates = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date);
        }
        return dates;
    }

    // Statistics calculations
    calculateStreak(habitId) {
        const habitCommits = this.commits
            .filter(c => c.habitId === habitId)
            .map(c => c.date)
            .sort()
            .reverse();

        if (habitCommits.length === 0) return 0;

        let streak = 0;
        const today = this.getDateString(new Date());
        let checkDate = new Date();

        // Check if committed today or yesterday
        if (habitCommits[0] !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (habitCommits[0] !== this.getDateString(yesterday)) {
                return 0;
            }
            checkDate = yesterday;
        }

        // Count consecutive days
        for (const commitDate of habitCommits) {
            const expectedDate = this.getDateString(checkDate);
            if (commitDate === expectedDate) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    calculateLongestStreak(habitId) {
        const habitCommits = this.commits
            .filter(c => c.habitId === habitId)
            .map(c => c.date)
            .sort();

        if (habitCommits.length === 0) return 0;

        let maxStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < habitCommits.length; i++) {
            const prevDate = new Date(habitCommits[i - 1]);
            const currDate = new Date(habitCommits[i]);
            const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return maxStreak;
    }

    getTotalCommits(habitId = null) {
        if (habitId) {
            return this.commits.filter(c => c.habitId === habitId).length;
        }
        return this.commits.length;
    }

    getTodayCommits() {
        const today = this.getDateString(new Date());
        return this.commits.filter(c => c.date === today).length;
    }

    getWeeklyCompletionRate() {
        const last7Days = this.getDaysArray(7);
        const totalPossible = this.habits.length * 7;
        if (totalPossible === 0) return 0;

        const completed = this.commits.filter(c => {
            const commitDate = new Date(c.date);
            return last7Days.some(d => this.getDateString(d) === this.getDateString(commitDate));
        }).length;

        return Math.round((completed / totalPossible) * 100);
    }

    getMaxStreak() {
        if (this.habits.length === 0) return 0;
        return Math.max(...this.habits.map(h => this.calculateLongestStreak(h.id)), 0);
    }

    getCurrentMaxStreak() {
        if (this.habits.length === 0) return 0;
        return Math.max(...this.habits.map(h => this.calculateStreak(h.id)), 0);
    }

    // Rendering
    render() {
        this.renderHabits();
        this.renderStats();
        this.renderContributionGraph();
        this.renderHistory();
        this.updateFilterTabs();
        this.renderCharts();
    }

    renderHabits() {
        if (this.habits.length === 0) {
            this.habitsGrid.style.display = 'none';
            this.emptyState.classList.add('visible');
            return;
        }

        this.habitsGrid.style.display = 'grid';
        this.emptyState.classList.remove('visible');

        this.habitsGrid.innerHTML = this.habits.map(habit => {
            const today = this.getDateString(new Date());
            const isCommittedToday = this.commits.some(
                c => c.habitId === habit.id && c.date === today
            );
            const streak = this.calculateStreak(habit.id);
            const totalCommits = this.getTotalCommits(habit.id);

            return `
                <div class="habit-card" style="--habit-color: ${habit.color}">
                    <div class="habit-header">
                        <div class="habit-name">${this.escapeHtml(habit.name)}</div>
                        <div class="habit-actions">
                            <button class="habit-action-btn edit-habit-btn" data-habit-id="${habit.id}" title="Edit">
                                ✏️
                            </button>
                            <button class="habit-action-btn delete-habit-btn" data-habit-id="${habit.id}" title="Delete">
                               🗑️
                            </button>
                        </div>
                    </div>
                    <div class="habit-stats">
                        <div class="habit-stat">
                            <span>🔥</span>
                            <span>${streak} day streak</span>
                        </div>
                        <div class="habit-stat">
                            <span>✅</span>
                            <span>${totalCommits} commits</span>
                        </div>
                    </div>
                    <button 
                        class="commit-btn ${isCommittedToday ? 'completed' : ''} commit-habit-btn"
                        data-habit-id="${habit.id}"
                        ${isCommittedToday ? 'disabled' : ''}
                    >
                        ${isCommittedToday ? '✓ Committed Today' : 'Commit Today'}
                    </button>
                </div>
            `;
        }).join('');

        // Add event delegation for dynamically created buttons
        this.habitsGrid.querySelectorAll('.edit-habit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const habitId = btn.dataset.habitId;
                const habit = this.habits.find(h => h.id === habitId);
                this.openModal(habit);
            });
        });

        this.habitsGrid.querySelectorAll('.delete-habit-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const habitId = btn.dataset.habitId;
                await this.deleteHabit(habitId);
            });
        });

        this.habitsGrid.querySelectorAll('.commit-habit-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const habitId = btn.dataset.habitId;
                await this.commitHabit(habitId);
            });
        });
    }

    renderStats() {
        this.totalCommitsEl.textContent = this.getTotalCommits();
        this.currentStreakEl.textContent = this.getCurrentMaxStreak();
        this.longestStreakEl.textContent = this.getMaxStreak();
        this.totalHabitsEl.textContent = this.habits.length;
        this.completionRateEl.textContent = this.getWeeklyCompletionRate() + '%';
        this.todayCommitsEl.textContent = this.getTodayCommits();
    }

    renderContributionGraph() {
        const days = this.getDaysArray(365);

        this.contributionGraph.innerHTML = days.map(date => {
            const dateStr = this.getDateString(date);
            const commitsOnDate = this.commits.filter(c => {
                if (this.currentFilter === 'all') return c.date === dateStr;
                return c.date === dateStr && c.habitId === this.currentFilter;
            }).length;

            const level = Math.min(4, commitsOnDate);

            return `
                <div 
                    class="contribution-day" 
                    data-level="${level}"
                    data-date="${dateStr}"
                    title="${dateStr}: ${commitsOnDate} commit${commitsOnDate !== 1 ? 's' : ''}"
                ></div>
            `;
        }).join('');

        // Render month labels
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        this.contributionMonths.innerHTML = months.map(month => `<div>${month}</div>`).join('');
    }

    updateFilterTabs() {
        this.filterTabs.innerHTML = `
            <button class="filter-tab ${this.currentFilter === 'all' ? 'active' : ''}" data-habit="all">
                All Habits
            </button>
            ${this.habits.map(habit => `
                <button class="filter-tab ${this.currentFilter === habit.id ? 'active' : ''}" data-habit="${habit.id}">
                    ${this.escapeHtml(habit.name)}
                </button>
            `).join('')}
        `;

        this.filterTabs.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentFilter = tab.dataset.habit;
                this.updateFilterTabs();
                this.renderContributionGraph();
            });
        });
    }

    renderHistory() {
        const recentCommits = [...this.commits]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 20);

        if (recentCommits.length === 0) {
            this.historyList.style.display = 'none';
            this.emptyHistory.style.display = 'block';
            return;
        }

        this.historyList.style.display = 'block';
        this.emptyHistory.style.display = 'none';

        this.historyList.innerHTML = recentCommits.map(commit => {
            const habit = this.habits.find(h => h.id === commit.habitId);
            if (!habit) return '';

            const date = new Date(commit.timestamp);
            const timeStr = this.formatTimeAgo(date);

            return `
                <div class="history-item" style="--habit-color: ${habit.color}">
                    <div class="history-dot"></div>
                    <div class="history-content">
                        <div class="history-habit">${this.escapeHtml(habit.name)}</div>
                        <div class="history-time">${timeStr}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Celebration effects
    celebrateStreak(streak) {
        this.triggerConfetti();

        // Could add sound effects or notifications here
        console.log(`🎉 ${streak} day streak achieved!`);
    }

    triggerConfetti() {
        this.confettiCanvas.width = window.innerWidth;
        this.confettiCanvas.height = window.innerHeight;

        const confetti = [];
        const colors = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'];

        for (let i = 0; i < 100; i++) {
            confetti.push({
                x: Math.random() * this.confettiCanvas.width,
                y: -10,
                size: Math.random() * 8 + 4,
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 2 - 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 - 5
            });
        }

        const animate = () => {
            this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

            confetti.forEach((p, index) => {
                this.confettiCtx.save();
                this.confettiCtx.translate(p.x, p.y);
                this.confettiCtx.rotate(p.rotation * Math.PI / 180);
                this.confettiCtx.fillStyle = p.color;
                this.confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                this.confettiCtx.restore();

                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotationSpeed;

                if (p.y > this.confettiCanvas.height) {
                    confetti.splice(index, 1);
                }
            });

            if (confetti.length > 0) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
            }
        }

        return 'just now';
    }

    // Chart rendering
    getWeeklyData() {
        const weeks = 12;
        const weeklyData = [];
        const today = new Date();

        for (let i = weeks - 1; i >= 0; i--) {
            const weekEnd = new Date(today);
            weekEnd.setDate(today.getDate() - (i * 7));
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekEnd.getDate() - 6);

            const weekCommits = this.commits.filter(c => {
                const commitDate = new Date(c.date);
                return commitDate >= weekStart && commitDate <= weekEnd;
            }).length;

            const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
            weeklyData.push({ label: weekLabel, commits: weekCommits });
        }

        return weeklyData;
    }

    getDayOfWeekData() {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayData = days.map(() => ({ possible: 0, actual: 0 }));

        // Calculate for last 8 weeks
        const last56Days = this.getDaysArray(56);

        last56Days.forEach(date => {
            const dayOfWeek = date.getDay();
            const dateStr = this.getDateString(date);

            dayData[dayOfWeek].possible += this.habits.length;
            dayData[dayOfWeek].actual += this.commits.filter(c => c.date === dateStr).length;
        });

        return days.map((day, i) => {
            const percentage = dayData[i].possible > 0
                ? Math.round((dayData[i].actual / dayData[i].possible) * 100)
                : 0;
            return percentage;
        });
    }

    renderCharts() {
        this.renderWeeklyProgressChart();
        this.renderPersonalityRadarChart();
    }

    renderWeeklyProgressChart() {
        if (!this.weeklyProgressCanvas) return;

        const weeklyData = this.getWeeklyData();

        // Destroy existing chart
        if (this.weeklyProgressChart) {
            this.weeklyProgressChart.destroy();
        }

        this.weeklyProgressChart = new Chart(this.weeklyProgressCanvas, {
            type: 'bar',
            data: {
                labels: weeklyData.map(w => w.label),
                datasets: [{
                    label: 'Commits per Week',
                    data: weeklyData.map(w => w.commits),
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 2,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(22, 27, 34, 0.9)',
                        titleColor: '#f0f6fc',
                        bodyColor: '#8b949e',
                        borderColor: '#30363d',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            title: (items) => `Week of ${items[0].label}`,
                            label: (item) => `${item.parsed.y} commits`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#8b949e',
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(48, 54, 61, 0.5)',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: {
                            color: '#8b949e'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    renderPersonalityRadarChart() {
        if (!this.personalityRadarCanvas) return;

        const dayData = this.getDayOfWeekData();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Destroy existing chart
        if (this.personalityRadarChart) {
            this.personalityRadarChart.destroy();
        }

        this.personalityRadarChart = new Chart(this.personalityRadarCanvas, {
            type: 'radar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Completion Rate',
                    data: dayData,
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                    pointBorderColor: '#f0f6fc',
                    pointHoverBackgroundColor: '#f0f6fc',
                    pointHoverBorderColor: 'rgba(34, 197, 94, 1)',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(22, 27, 34, 0.9)',
                        titleColor: '#f0f6fc',
                        bodyColor: '#8b949e',
                        borderColor: '#30363d',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (item) => `${item.parsed.r}% completion rate`
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#8b949e',
                            backdropColor: 'transparent',
                            stepSize: 20
                        },
                        grid: {
                            color: 'rgba(48, 54, 61, 0.5)'
                        },
                        pointLabels: {
                            color: '#f0f6fc',
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
}

// Initialize the app
const tracker = new HabitTracker();
