// API Base URL
const API_URL = '/api';

// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const clearBtn = document.getElementById('clearBtn');
const actionSection = document.getElementById('actionSection');
const dateDisplay = document.getElementById('dateDisplay');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');
const toast = document.getElementById('toast');

let todos = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDateDisplay();
    loadTodos();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    clearBtn.addEventListener('click', clearCompleted);

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.closest('.filter-btn').classList.add('active');
            currentFilter = e.target.closest('.filter-btn').dataset.filter;
            renderTodos();
        });
    });
}

// Update Date Display
function updateDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    dateDisplay.textContent = today.toLocaleDateString('en-US', options);
}

// Load todos from server
async function loadTodos() {
    try {
        const response = await fetch(`${API_URL}/todos`);
        const data = await response.json();
        todos = data.todos;
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Error loading todos:', error);
        showToast('Failed to load todos', 'error');
    }
}

// Add new todo
async function addTodo() {
    const title = todoInput.value.trim();

    if (!title) {
        showToast('Please enter a task', 'error');
        todoInput.focus();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title }),
        });

        if (!response.ok) {
            throw new Error('Failed to add todo');
        }

        const data = await response.json();
        todos.push(data.todo);
        todoInput.value = '';
        todoInput.focus();
        renderTodos();
        updateStats();
        showToast('Task added successfully', 'success');
    } catch (error) {
        console.error('Error adding todo:', error);
        showToast('Failed to add task', 'error');
    }
}

// Toggle todo completion
async function toggleTodo(id) {
    try {
        const response = await fetch(`${API_URL}/todos/${id}/toggle`, {
            method: 'PATCH',
        });

        if (!response.ok) {
            throw new Error('Failed to toggle todo');
        }

        const data = await response.json();
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = data.todo;
        }
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Error toggling todo:', error);
        showToast('Failed to update task', 'error');
    }
}

// Delete todo
async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete todo');
        }

        todos = todos.filter(t => t.id !== id);
        renderTodos();
        updateStats();
        showToast('Task deleted', 'success');
    } catch (error) {
        console.error('Error deleting todo:', error);
        showToast('Failed to delete task', 'error');
    }
}

// Clear completed todos
async function clearCompleted() {
    const completedTodos = todos.filter(t => t.completed);
    if (completedTodos.length === 0) {
        showToast('No completed tasks to clear', 'error');
        return;
    }

    for (const todo of completedTodos) {
        await deleteTodo(todo.id);
    }
}

// Render todos based on filter
function renderTodos() {
    let filtered = todos;

    if (currentFilter === 'active') {
        filtered = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filtered = todos.filter(t => t.completed);
    }

    if (filtered.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>${currentFilter === 'all' ? 'No todos yet. Add one to get started!' : 'No ' + currentFilter + ' tasks.'}</p>
            </div>
        `;
        return;
    }

    todoList.innerHTML = filtered.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${escapeHtml(todo.title)}</span>
            <div class="todo-actions">
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;

    // Show/hide action section
    if (completed > 0) {
        actionSection.style.display = 'block';
    } else {
        actionSection.style.display = 'none';
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
