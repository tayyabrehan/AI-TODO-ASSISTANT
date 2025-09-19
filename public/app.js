const todosApiBase = '/api/todos';
const assistantApiBase = '/api/assistant';

// DOM Elements
const form = document.getElementById('todo-form');
const todoIdInput = document.getElementById('todo-id');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const priorityInput = document.getElementById('priority');
const dueDateInput = document.getElementById('due-date');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-edit');
const todosContainer = document.getElementById('todos-container');

// AI Assistant Elements
const assistantPromptInput = document.getElementById('assistant-prompt');
const assistantBtn = document.getElementById('assistant-btn');
const suggestionsContainer = document.getElementById('suggestions');

// Filter Elements
const filterAllBtn = document.getElementById('filter-all');
const filterActiveBtn = document.getElementById('filter-active');
const filterCompletedBtn = document.getElementById('filter-completed');

// Current filter state
let currentFilter = 'all';

// Fetch and render todos
async function fetchTodos() {
  try {
    const res = await fetch(todosApiBase);
    const todos = await res.json();
    renderTodos(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    showNotification('Failed to load todos', 'error');
  }
}

// Render todos based on current filter
function renderTodos(todos) {
  // Apply filter
  const filteredTodos = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true; // 'all' filter
  });

  todosContainer.innerHTML = '';
  
  if (filteredTodos.length === 0) {
    todosContainer.innerHTML = `<div class="empty-state">No todos found</div>`;
    return;
  }

  filteredTodos.forEach(todo => {
    const todoEl = document.createElement('div');
    todoEl.className = `todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`;
    todoEl.dataset.id = todo._id;
    
    const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date';
    const startTime = todo.startTime ? todo.startTime : '';
    const endTime = todo.endTime ? todo.endTime : '';
    const timeDisplay = (startTime && endTime) ? `${startTime} - ${endTime}` : 
                        (startTime) ? `Starts: ${startTime}` : 
                        (endTime) ? `Ends: ${endTime}` : '';
    
    todoEl.innerHTML = `
      <div class="todo-header">
        <div class="todo-checkbox">
          <input type="checkbox" ${todo.completed ? 'checked' : ''} />
        </div>
        <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
        <div class="todo-priority">${todo.priority}</div>
      </div>
      <div class="todo-body">
        <p class="todo-description">${escapeHtml(todo.description || '')}</p>
        <div class="todo-meta">
          <span class="todo-date">Due: ${dueDate}</span>
          ${timeDisplay ? `<span class="todo-time">${timeDisplay}</span>` : ''}
          <span class="todo-created">Created: ${new Date(todo.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="todo-actions">
        <button class="edit-btn"><i class="fas fa-edit"></i></button>
        <button class="delete-btn"><i class="fas fa-trash"></i></button>
      </div>
    `;
    
    todosContainer.appendChild(todoEl);
  });

  // Add event listeners to todo items
  addTodoEventListeners();
}

// Add event listeners to todo items
function addTodoEventListeners() {
  // Checkbox toggle
  document.querySelectorAll('.todo-checkbox input').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const todoId = e.target.closest('.todo-item').dataset.id;
      await toggleTodoCompletion(todoId);
    });
  });

  // Edit button
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const todoId = e.target.closest('.todo-item').dataset.id;
      await editTodo(todoId);
    });
  });

  // Delete button
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const todoId = e.target.closest('.todo-item').dataset.id;
      await deleteTodo(todoId);
    });
  });
}

// Toggle todo completion status
async function toggleTodoCompletion(todoId) {
  try {
    const res = await fetch(`${todosApiBase}/${todoId}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showNotification(`Error: ${err.error || res.statusText}`, 'error');
      return;
    }

    fetchTodos(); // Refresh todos
    showNotification('Todo status updated', 'success');
  } catch (error) {
    console.error('Error toggling todo:', error);
    showNotification('Failed to update todo status', 'error');
  }
}

// Edit todo
async function editTodo(todoId) {
  try {
    const res = await fetch(`${todosApiBase}/${todoId}`);
    const todo = await res.json();
    
    todoIdInput.value = todo._id;
    titleInput.value = todo.title;
    descriptionInput.value = todo.description || '';
    priorityInput.value = todo.priority;
    if (todo.dueDate) {
      const date = new Date(todo.dueDate);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
      dueDateInput.value = localDate;
    } else {
      dueDateInput.value = '';
    }
    
    startTimeInput.value = todo.startTime || '';
    endTimeInput.value = todo.endTime || '';
    
    submitBtn.textContent = 'Update Todo';
    cancelBtn.hidden = false;
    
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error fetching todo for edit:', error);
    showNotification('Failed to load todo details', 'error');
  }
}

// Delete todo
async function deleteTodo(todoId) {
  if (!confirm('Are you sure you want to delete this todo?')) return;
  
  try {
    const res = await fetch(`${todosApiBase}/${todoId}`, { method: 'DELETE' });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showNotification(`Error: ${err.error || res.statusText}`, 'error');
      return;
    }
    
    fetchTodos(); // Refresh todos
    showNotification('Todo deleted successfully', 'success');
  } catch (error) {
    console.error('Error deleting todo:', error);
    showNotification('Failed to delete todo', 'error');
  }
}

// Form submission handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const payload = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    priority: priorityInput.value,
    dueDate: dueDateInput.value || null,
    startTime: startTimeInput.value || null,
    endTime: endTimeInput.value || null
  };
  
  const todoId = todoIdInput.value;
  const method = todoId ? 'PUT' : 'POST';
  const url = todoId ? `${todosApiBase}/${todoId}` : todosApiBase;
  
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showNotification(`Error: ${err.error || res.statusText}`, 'error');
      return;
    }
    
    resetForm();
    fetchTodos();
    showNotification(todoId ? 'Todo updated successfully' : 'Todo added successfully', 'success');
  } catch (error) {
    console.error('Error saving todo:', error);
    showNotification('Failed to save todo', 'error');
  }
});

// AI Assistant functionality
assistantBtn.addEventListener('click', async () => {
  const prompt = assistantPromptInput.value.trim();
  if (!prompt) {
    showNotification('Please enter a prompt for the assistant', 'error');
    return;
  }
  
  try {
    assistantBtn.disabled = true;
    assistantBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    const res = await fetch(`${assistantApiBase}/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      showNotification(`Error: ${data.error || res.statusText}`, 'error');
      return;
    }
    
    renderSuggestions(data.suggestions, data.source);
    
    // Show appropriate notification based on source
    if (data.source === 'groq') {
      showNotification('Groq AI generated suggestions for you!', 'success');
    } else if (data.note) {
      showNotification(data.note, 'warning');
    } else {
      showNotification('Generated suggestions for you!', 'success');
    }
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    showNotification('Failed to get AI suggestions', 'error');
  } finally {
    assistantBtn.disabled = false;
    assistantBtn.innerHTML = '<i class="fas fa-robot"></i> Ask Assistant';
  }
});

// Render AI suggestions
function renderSuggestions(suggestions, source = 'local') {
  suggestionsContainer.innerHTML = '';
  
  // Add source indicator
  const sourceIndicator = document.createElement('div');
  sourceIndicator.className = `source-indicator ${source === 'groq' ? 'ai-source' : 'local-source'}`;
  sourceIndicator.innerHTML = `
    <span class="source-icon">${source === 'groq' ? '<i class="fas fa-brain"></i>' : '<i class="fas fa-code"></i>'}</span>
    <span class="source-text">${source === 'groq' ? 'Powered by Groq AI' : 'Local suggestions'}</span>
  `;
  suggestionsContainer.appendChild(sourceIndicator);
  
  if (!suggestions || suggestions.length === 0) {
    suggestionsContainer.innerHTML += '<div class="empty-state">No suggestions available</div>';
    return;
  }
  
  const suggestionsWrapper = document.createElement('div');
  suggestionsWrapper.className = 'suggestions-wrapper';
  suggestionsContainer.appendChild(suggestionsWrapper);
  
  suggestions.forEach(suggestion => {
    const suggestionEl = document.createElement('div');
    suggestionEl.className = 'suggestion-item';
    
    suggestionEl.innerHTML = `
      <h4>${escapeHtml(suggestion.title)}</h4>
      <p>${escapeHtml(suggestion.description || '')}</p>
      <div class="suggestion-meta">
        <span class="priority-tag priority-${suggestion.priority || 'medium'}">Priority: ${suggestion.priority || 'medium'}</span>
      </div>
      <button class="use-suggestion-btn">Use This</button>
    `;
    
    suggestionsWrapper.appendChild(suggestionEl);
    
    // Add event listener to use suggestion button
    const useBtn = suggestionEl.querySelector('.use-suggestion-btn');
    useBtn.addEventListener('click', () => {
      titleInput.value = suggestion.title;
      descriptionInput.value = suggestion.description || '';
      priorityInput.value = suggestion.priority || 'medium';
      
      if (suggestion.dueDate) {
        dueDateInput.value = suggestion.dueDate;
      }
      
      if (suggestion.startTime) {
        startTimeInput.value = suggestion.startTime;
      }
      
      if (suggestion.endTime) {
        endTimeInput.value = suggestion.endTime;
      }
      
      // Scroll to form
      form.scrollIntoView({ behavior: 'smooth' });
      titleInput.focus();
    });
  });
}


// Filter event listeners
filterAllBtn.addEventListener('click', () => setFilter('all'));
filterActiveBtn.addEventListener('click', () => setFilter('active'));
filterCompletedBtn.addEventListener('click', () => setFilter('completed'));

// Set active filter
function setFilter(filter) {
  currentFilter = filter;
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`filter-${filter}`).classList.add('active');
  
  // Refresh todos with filter
  fetchTodos();
}

// Reset form
function resetForm() {
  todoIdInput.value = '';
  form.reset();
  submitBtn.textContent = 'Add Todo';
  cancelBtn.hidden = true;
}

// Cancel button handler
cancelBtn.addEventListener('click', () => {
  resetForm();
});

// Helper function to escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Initialize
fetchTodos();


