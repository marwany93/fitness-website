// ===================================
// Admin Dashboard Logic
// ===================================

let currentUser = null;
let currentClientId = null;
let messageUnsubscribe = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    if (FirebaseHelper.initializeFirebase()) {
        // Check auth state
        FirebaseHelper.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                showDashboard();
            } else {
                showLogin();
            }
        });
    } else {
        showError('Firebase not configured. Please add your config to firebase-config.js');
    }

    // Setup event listeners
    setupEventListeners();
});

// ===================================
// Authentication
// ===================================

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // Add client button
    document.getElementById('addClientBtn')?.addEventListener('click', () => {
        document.getElementById('addClientModal').classList.add('active');
    });

    // Add client form
    document.getElementById('addClientForm')?.addEventListener('submit', handleAddClient);

    // Send message form
    document.getElementById('sendMessageForm')?.addEventListener('submit', handleSendMessage);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });

    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu a[data-view]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.target.closest('a').dataset.view;
            switchView(view);
        });
    });
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    const result = await FirebaseHelper.signIn(email, password);

    if (result.success) {
        errorDiv.style.display = 'none';
        // Will trigger onAuthStateChanged
    } else {
        errorDiv.textContent = result.error;
        errorDiv.style.display = 'block';
    }
}

async function handleLogout(e) {
    e.preventDefault();

    if (messageUnsubscribe) {
        messageUnsubscribe();
    }

    await FirebaseHelper.signOut();
    showLogin();
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboardScreen').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'grid';

    // Set trainer name
    if (currentUser) {
        document.getElementById('trainerName').textContent = currentUser.email;
    }

    // Load clients
    loadClients();
}

// ===================================
// Clients Management
// ===================================

async function loadClients() {
    const grid = document.getElementById('clientsGrid');
    grid.innerHTML = '<p>جاري التحميل... / Loading...</p>';

    const result = await FirebaseHelper.getAllClients();

    if (result.success) {
        if (result.data.length === 0) {
            grid.innerHTML = '<p>لا يوجد متدربين حالياً / No clients yet</p>';
            return;
        }

        grid.innerHTML = '';
        result.data.forEach(client => {
            grid.appendChild(createClientCard(client));
        });
    } else {
        grid.innerHTML = `<p>خطأ في تحميل البيانات: ${result.error}</p>`;
    }
}

function createClientCard(client) {
    const card = document.createElement('div');
    card.className = 'client-card';
    card.onclick = () => openClientModal(client);

    const initials = client.name.split(' ').map(n => n[0]).join('').toUpperCase();

    card.innerHTML = `
    <div class="client-header">
      <div class="client-avatar">${initials}</div>
      <div class="client-info">
        <h3>${client.name}</h3>
        <span class="client-status status-${client.status}">${client.status}</span>
      </div>
    </div>
    <div style="margin-top: var(--space-md); padding-top: var(--space-md); border-top: 1px solid var(--gray-200);">
      <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: var(--space-xs);">
        <i class="fas fa-envelope"></i> ${client.email}
      </p>
      ${client.phone ? `<p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: var(--space-xs);">
        <i class="fas fa-phone"></i> ${client.phone}
      </p>` : ''}
      <p style="font-size: 0.875rem; color: var(--gray-600);">
        <i class="fas fa-box"></i> Package: ${client.package}
      </p>
    </div>
  `;

    return card;
}

async function handleAddClient(e) {
    e.preventDefault();

    const clientData = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        package: document.getElementById('clientPackage').value
    };

    const result = await FirebaseHelper.addClient(clientData);

    if (result.success) {
        closeAddClientModal();
        loadClients();
        document.getElementById('addClientForm').reset();
        alert('تم إضافة المتدرب بنجاح! / Client added successfully!');
    } else {
        alert('خطأ: ' + result.error);
    }
}

// ===================================
// Client Modal
// ===================================

async function openClientModal(client) {
    currentClientId = client.id;
    document.getElementById('modalClientName').textContent = client.name;
    document.getElementById('clientModal').classList.add('active');

    // Switch to messages tab by default
    switchTab('messages');

    // Load messages
    loadMessages(client.id);

    // Load client assignments
    loadClientAssignments(client.id);

    // Load client info
    displayClientInfo(client);

    // Setup assign workout button
    setupAssignWorkoutButton();
}

function closeClientModal() {
    document.getElementById('clientModal').classList.remove('active');
    if (messageUnsubscribe) {
        messageUnsubscribe();
    }
    currentClientId = null;
}

function closeAddClientModal() {
    document.getElementById('addClientModal').classList.remove('active');
}

// Switch tabs in modal
function switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Show/hide tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });

    document.getElementById(`${tabName}Tab`).style.display = 'block';
}

function switchView(viewName) {
    // Update active menu item
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.view === viewName) {
            link.classList.add('active');
        }
    });

    // Show/hide views
    document.getElementById('clientsView').style.display = viewName === 'clients' ? 'block' : 'none';
    document.getElementById('workoutsView').style.display = viewName === 'workouts' ? 'block' : 'none';
}

// ===================================
// Messaging
// ===================================

async function loadMessages(clientId) {
    const thread = document.getElementById('messageThread');

    // Unsubscribe from previous listener
    if (messageUnsubscribe) {
        messageUnsubscribe();
    }

    // Listen to real-time messages
    messageUnsubscribe = FirebaseHelper.listenToMessages(currentUser.uid, clientId, (messages) => {
        displayMessages(messages);
    });
}

function displayMessages(messages) {
    const thread = document.getElementById('messageThread');

    if (messages.length === 0) {
        thread.innerHTML = '<p style="text-align: center; color: var(--gray-500);">لا توجد رسائل بعد / No messages yet</p>';
        return;
    }

    thread.innerHTML = '';
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.senderType}`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = `
      <p>${msg.message}</p>
      <div class="message-time">${FirebaseHelper.formatDate(msg.timestamp)}</div>
    `;

        messageDiv.appendChild(bubble);
        thread.appendChild(messageDiv);
    });

    // Scroll to bottom
    thread.scrollTop = thread.scrollHeight;
}

async function handleSendMessage(e) {
    e.preventDefault();

    if (!currentClientId) return;

    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    if (!message) return;

    const result = await FirebaseHelper.sendMessage(
        currentUser.uid,
        currentClientId,
        message,
        'trainer'
    );

    if (result.success) {
        messageInput.value = '';
    } else {
        alert('خطأ في إرسال الرسالة: ' + result.error);
    }
}

// ===================================
// Workout Assignments
// ===================================

async function loadClientAssignments(clientId) {
    const container = document.getElementById('clientWorkouts');
    container.innerHTML = '<p>جاري التحميل... / Loading...</p>';

    const result = await FirebaseHelper.getClientAssignments(clientId);

    if (result.success) {
        if (result.data.length === 0) {
            container.innerHTML = '<p>لا توجد تمارين مخصصة بعد / No assigned workouts yet</p>';
            return;
        }

        container.innerHTML = '';
        result.data.forEach(assignment => {
            container.appendChild(createAssignmentCard(assignment));
        });
    } else {
        container.innerHTML = '<p>خطأ في تحميل التمارين: ' + result.error + '</p>';
    }
}

function createAssignmentCard(assignment) {
    const card = document.createElement('div');
    card.className = 'card mb-md';

    const statusColor = assignment.completed ? 'var(--success)' : 'var(--warning)';
    const statusText = assignment.completed ? 'مكتمل / Completed' : 'قيد التنفيذ / Pending';

    card.innerHTML = `
    <h3 style="margin-bottom: var(--space-sm);">${assignment.workout?.title || 'Workout'}</h3>
    <p style="font-size: 0.875rem; color: ${statusColor}; margin-bottom: var(--space-md);">
      <i class="fas fa-check-circle"></i> ${statusText}
    </p>
    ${assignment.trainerNotes ? `
      <p style="background: var(--gray-100); padding: var(--space-sm); border-radius: var(--radius-md); margin-bottom: var(--space-sm);">
        <strong>ملاحظات / Notes:</strong> ${assignment.trainerNotes}
      </p>
    ` : ''}
    ${assignment.clientFeedback && assignment.completed ? `
      <p style="background: linear-gradient(135deg, var(--secondary-green), #16a34a); color: white; padding: var(--space-sm); border-radius: var(--radius-md); margin-bottom: var(--space-sm);">
        <strong><i class="fas fa-comment-dots"></i> رأي المتدرب / Client Feedback:</strong>
        <br>
        "${assignment.clientFeedback}"
      </p>
    ` : ''}
    <p style="font-size: 0.875rem; color: var(--gray-600);">
      تاريخ التعيين / Assigned: ${FirebaseHelper.formatDate(assignment.assignedDate)}
    </p>
    ${assignment.completed && assignment.completedDate ? `
      <p style="font-size: 0.875rem; color: var(--success);">
        <i class="fas fa-check"></i> تم الإكمال / Completed: ${FirebaseHelper.formatDate(assignment.completedDate)}
      </p>
    ` : ''}
  `;

    return card;
}

// Handle workout assignment
async function handleAssignWorkout() {
    if (!currentClientId) {
        alert('خطأ: لا يوجد متدرب محدد / Error: No client selected');
        return;
    }

    // Load available workouts
    const workoutsResult = await FirebaseHelper.getAllWorkouts();

    if (!workoutsResult.success) {
        alert('خطأ في تحميل التمارين: ' + workoutsResult.error);
        return;
    }

    if (workoutsResult.data.length === 0) {
        alert('⚠️ لا توجد تمارين متاحة!\n\nيجب إضافة تمرين أولاً في Firebase Console:\n1. Firestore Database → workouts\n2. Add Document\n3. املأ الحقول (title, exercises, duration)\n\nأو اتبع التعليمات في QUICK_START.md');
        return;
    }

    // Create workout selection list
    let workoutsList = 'اختر رقم التمرين / Select workout number:\n\n';
    workoutsResult.data.forEach((workout, index) => {
        workoutsList += `${index + 1}. ${workout.title || workout.titleAr} (${workout.difficulty || 'beginner'})\n`;
    });

    const selection = prompt(workoutsList + '\nأدخل رقم التمرين / Enter workout number:');

    if (!selection) return; // User cancelled

    const workoutIndex = parseInt(selection) - 1;

    if (workoutIndex < 0 || workoutIndex >= workoutsResult.data.length) {
        alert('رقم غير صحيح! / Invalid number!');
        return;
    }

    const selectedWorkout = workoutsResult.data[workoutIndex];

    // Get trainer notes
    const notes = prompt(`تعيين تمرين: ${selectedWorkout.title}\n\nملاحظات للمتدرب (اختياري) / Trainer notes (optional):`);

    // Assign workout
    const result = await FirebaseHelper.assignWorkout(
        currentClientId,
        selectedWorkout.id,
        notes || '',
        null // dueDate - optional
    );

    if (result.success) {
        alert('✅ تم تعيين التمرين بنجاح! / Workout assigned successfully!');
        // Reload assignments
        loadClientAssignments(currentClientId);
    } else {
        alert('خطأ في تعيين التمرين: ' + result.error);
    }
}

// Setup assign workout button when client modal opens
function setupAssignWorkoutButton() {
    const btn = document.getElementById('assignWorkoutBtn');
    if (btn) {
        // Remove old listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        // Add new listener
        newBtn.addEventListener('click', handleAssignWorkout);
    }
}

// ===================================
// Client Info
// ===================================

function displayClientInfo(client) {
    const container = document.getElementById('clientInfo');

    container.innerHTML = `
    <div class="card">
      <h3 style="margin-bottom: var(--space-md);">معلومات المتدرب / Client Information</h3>
      
      <div style="margin-bottom: var(--space-md);">
        <strong>الاسم / Name:</strong>
        <p>${client.name}</p>
      </div>
      
      <div style="margin-bottom: var(--space-md);">
        <strong>البريد الإلكتروني / Email:</strong>
        <p>${client.email}</p>
      </div>
      
      ${client.phone ? `
        <div style="margin-bottom: var(--space-md);">
          <strong>الهاتف / Phone:</strong>
          <p>${client.phone}</p>
        </div>
      ` : ''}
      
      <div style="margin-bottom: var(--space-md);">
        <strong>الباقة / Package:</strong>
        <p style="text-transform: capitalize;">${client.package}</p>
      </div>
      
      <div style="margin-bottom: var(--space-md);">
        <strong>الحالة / Status:</strong>
        <p><span class="client-status status-${client.status}">${client.status}</span></p>
      </div>
      
      <div>
        <strong>تاريخ الانضمام / Joined:</strong>
        <p>${FirebaseHelper.formatDate(client.createdAt)}</p>
      </div>
    </div>
  `;
}

// ===================================
// Utilities
// ===================================

function showError(message) {
    alert(message);
}

// Close modals on outside click
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        if (messageUnsubscribe) {
            messageUnsubscribe();
        }
    }
}

// ===================================
// Workout Management
// ===================================

let exerciseCount = 0;
let currentUserRole = null;

// Load workouts library
async function loadWorkouts() {
    const grid = document.getElementById('workoutsGrid');
    grid.innerHTML = '<p>جاري التحميل... / Loading...</p>';

    const result = await FirebaseHelper.getAllWorkouts();

    if (result.success) {
        if (result.data.length === 0) {
            grid.innerHTML = '<p>لا توجد تمارين في المكتبة / No workouts in library yet</p>';
            return;
        }

        grid.innerHTML = '';
        result.data.forEach(workout => {
            grid.appendChild(createWorkoutCard(workout));
        });
    } else {
        grid.innerHTML = `<p>خطأ في تحميل التمارين: ${result.error}</p>`;
    }
}

function createWorkoutCard(workout) {
    const card = document.createElement('div');
    card.className = 'workout-card';

    const difficultyClass = `difficulty-${workout.difficulty || 'beginner'}`;
    const exerciseCount = workout.exercises ? workout.exercises.length : 0;

    card.innerHTML = `
        <div>
            <span class="workout-difficulty ${difficultyClass}">${workout.difficulty || 'beginner'}</span>
            <h3 style="margin: var(--space-sm) 0;">${workout.title || workout.titleAr}</h3>
            <p style="color: var(--gray-600); font-size: 0.875rem;">
                <i class="fas fa-dumbbell"></i> ${exerciseCount} تمرين / exercises
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <i class="fas fa-clock"></i> ${workout.duration || 30} دقيقة / min
            </p>
        </div>
    `;

    return card;
}

// Open create workout modal
function openCreateWorkoutModal() {
    document.getElementById('createWorkoutModal').classList.add('active');
    // Add first exercise field by default
    if (exerciseCount === 0) {
        addExerciseField();
    }
}

function closeCreateWorkoutModal() {
    document.getElementById('createWorkoutModal').classList.remove('active');
    document.getElementById('createWorkoutForm').reset();
    document.getElementById('exercisesContainer').innerHTML = '';
    exerciseCount = 0;
}

// Add exercise field dynamically
function addExerciseField() {
    exerciseCount++;
    const container = document.getElementById('exercisesContainer');

    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-field';
    exerciseDiv.innerHTML = `
        <div class="card" style="margin-bottom: var(--space-md); padding: var(--space-md); background: var(--gray-50);">
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                <h4>تمرين ${exerciseCount} / Exercise ${exerciseCount}</h4>
                <button type="button" class="btn-icon" onclick="removeExercise(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">الاسم بالعربي</label>
                    <input type="text" class="ex-name-ar form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">English Name</label>
                    <input type="text" class="ex-name-en form-input" required>
                </div>
            </div>
            
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Sets</label>
                    <input type="number" class="ex-sets form-input" required min="1" value="3">
                </div>
                <div class="form-group">
                    <label class="form-label">Reps</label>
                    <input type="number" class="ex-reps form-input" required min="1" value="10">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">ملاحظات / Notes</label>
                <textarea class="ex-notes form-textarea" rows="2"></textarea>
            </div>
        </div>
    `;

    container.appendChild(exerciseDiv);
}

function removeExercise(button) {
    button.closest('.exercise-field').remove();
}

// Handle create workout form submission
async function handleCreateWorkout(e) {
    e.preventDefault();

    // Collect form data
    const titleAr = document.getElementById('workoutTitleAr').value;
    const titleEn = document.getElementById('workoutTitleEn').value;
    const difficulty = document.getElementById('workoutDifficulty').value;
    const duration = parseInt(document.getElementById('workoutDuration').value);

    // Collect exercises
    const exercises = [];
    const exerciseFields = document.querySelectorAll('.exercise-field');

    exerciseFields.forEach((field, index) => {
        const nameAr = field.querySelector('.ex-name-ar').value;
        const nameEn = field.querySelector('.ex-name-en').value;
        const sets = parseInt(field.querySelector('.ex-sets').value);
        const reps = parseInt(field.querySelector('.ex-reps').value);
        const notes = field.querySelector('.ex-notes').value;

        exercises.push({
            name: nameEn,
            nameAr: nameAr,
            sets: sets,
            reps: reps,
            notes: notes || ''
        });
    });

    if (exercises.length === 0) {
        alert('يجب إضافة تمرين واحد على الأقل! / Please add at least one exercise!');
        return;
    }

    // Create workout object
    const workoutData = {
        title: titleEn,
        titleAr: titleAr,
        difficulty: difficulty,
        duration: duration,
        exercises: exercises
    };

    // Save to Firebase
    const result = await FirebaseHelper.addWorkout(workoutData);

    if (result.success) {
        alert('✅ تم إنشاء التمرين بنجاح! / Workout created successfully!');
        closeCreateWorkoutModal();
        loadWorkouts(); // Reload workouts library
    } else {
        alert('خطأ في إنشاء التمرين: ' + result.error);
    }
}

// Check user role and update UI accordingly
async function checkUserRole() {
    try {
        const result = await FirebaseHelper.getClient(currentUser.uid);

        if (result.success) {
            currentUserRole = result.data.role || 'trainer';
            updateUIForRole(currentUserRole);
        }
    } catch (error) {
        console.error('Error checking user role:', error);
        currentUserRole = 'trainer'; // Default to trainer
    }
}

function updateUIForRole(role) {
    const createWorkoutBtn = document.getElementById('createWorkoutBtn');

    if (role === 'admin') {
        // Admin can create workouts
        if (createWorkoutBtn) {
            createWorkoutBtn.style.display = 'inline-flex';
        }
        console.log('👑 Admin mode activated');
    } else {
        // Trainer - read-only workout library
        if (createWorkoutBtn) {
            createWorkoutBtn.style.display = 'none';
        }
        console.log('👨‍🏫 Trainer mode activated');
    }
}

// Update setupEventListeners to include workout management
const originalSetupEventListeners = setupEventListeners;
setupEventListeners = function () {
    originalSetupEventListeners();

    // Create workout button
    document.getElementById('createWorkoutBtn')?.addEventListener('click', openCreateWorkoutModal);

    // Create workout form
    document.getElementById('createWorkoutForm')?.addEventListener('submit', handleCreateWorkout);
};

// Update showDashboard to check role and load workouts
const originalShowDashboard = showDashboard;
showDashboard = async function () {
    originalShowDashboard();

    // Check user role
    await checkUserRole();

    // Load workouts in workout library
    loadWorkouts();
};

