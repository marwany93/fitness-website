// ===================================
// Client Portal Logic - FIXED VERSION
// ===================================

let currentUser = null;
let trainerId = null; // Will be fetched from Firebase
let messageUnsubscribe = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    if (FirebaseHelper.initializeFirebase()) {
        // Check auth state
        FirebaseHelper.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                showPortal();
            } else {
                showLogin();
            }
        });
    } else {
        alert('Firebase not configured. Please add your config to firebase-config.js');
    }

    // Setup event listeners
    setupEventListeners();
});

// ===================================
// Event Listeners
// ===================================

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // Send message form
    document.getElementById('sendMessageForm')?.addEventListener('submit', handleSendMessage);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });
}

// ===================================
// Authentication
// ===================================

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    const result = await FirebaseHelper.signIn(email, password);

    if (result.success) {
        errorDiv.style.display = 'none';
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
    document.getElementById('portalScreen').style.display = 'none';
}

async function showPortal() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('portalScreen').style.display = 'block';

    // Load client data and trainer ID
    await loadClientData();

    // Load workouts
    await loadWorkouts();
}

// ===================================
// Client Data
// ===================================

async function loadClientData() {
    const result = await FirebaseHelper.getClient(currentUser.uid);

    if (result.success) {
        document.getElementById('clientName').textContent = `مرحباً ${result.data.name} / Welcome ${result.data.name}`;
        document.getElementById('clientEmail').textContent = result.data.email;

        // Fetch trainer ID automatically
        await fetchTrainerId();
    }
}

// Fetch trainer ID from users collection
async function fetchTrainerId() {
    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('users').where('role', '==', 'trainer').limit(1).get();

        if (!snapshot.empty) {
            trainerId = snapshot.docs[0].id;
            console.log('✅ Trainer ID loaded:', trainerId);
            // Now load messages with correct trainer ID
            loadMessages();
        } else {
            console.error('❌ No trainer found in database');
            alert('No trainer account found. Please ensure a trainer account exists in Firebase.');
        }
    } catch (error) {
        console.error('Error fetching trainer:', error);
        alert('Error loading trainer information: ' + error.message);
    }
}

// ===================================
// Workouts
// ===================================

async function loadWorkouts() {
    const container = document.getElementById('workoutsList');
    container.innerHTML = '<p>جاري التحميل... / Loading...</p>';

    const result = await FirebaseHelper.getClientAssignments(currentUser.uid);

    if (result.success) {
        if (result.data.length === 0) {
            container.innerHTML = `
        <div class="card" style="text-align: center; padding: var(--space-xl);">
          <i class="fas fa-dumbbell" style="font-size: 4rem; color: var(--gray-300); margin-bottom: var(--space-md);"></i>
          <h3>لا توجد تمارين مخصصة بعد</h3>
          <p style="color: var(--gray-600);">No assigned workouts yet</p>
          <p style="color: var(--gray-600); margin-top: var(--space-md);">سيتم تخصيص التمارين من قبل مدربك قريباً</p>
        </div>
      `;
            return;
        }

        container.innerHTML = '';
        result.data.forEach(assignment => {
            container.appendChild(createWorkoutCard(assignment));
        });
    } else {
        container.innerHTML = `<p>خطأ في تحميل التمارين: ${result.error}</p>`;
    }
}

function createWorkoutCard(assignment) {
    const card = document.createElement('div');
    card.className = 'workout-card';

    const statusIcon = assignment.completed ?
        '<i class="fas fa-check-circle" style="color: var(--success);"></i>' :
        '<i class="fas fa-clock" style="color: var(--warning);"></i>';

    const statusText = assignment.completed ? 'مكتمل / Completed' : 'قيد التنفيذ / Pending';

    let exercisesHtml = '';
    if (assignment.workout && assignment.workout.exercises && assignment.workout.exercises.length > 0) {
        exercisesHtml = `
      <ul class="exercise-list">
        ${assignment.workout.exercises.map(ex => `
          <li class="exercise-item">
            <strong>${ex.name}</strong> - ${ex.sets} sets × ${ex.reps} reps
            ${ex.notes ? `<br><span style="font-size: 0.875rem; color: var(--gray-600);">${ex.notes}</span>` : ''}
          </li>
        `).join('')}
      </ul>
    `;
    }

    card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-md);">
      <h3 style="margin: 0;">${assignment.workout?.title || 'Workout Program'}</h3>
      <span style="font-size: 0.875rem;">${statusIcon} ${statusText}</span>
    </div>
    
    ${assignment.trainerNotes ? `
      <div style="background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%); color: white; padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); margin-bottom: var(--space-md);">
        <strong><i class="fas fa-comment"></i> ملاحظات المدرب / Trainer Notes:</strong>
        <p style="margin-top: var(--space-xs);">${assignment.trainerNotes}</p>
      </div>
    ` : ''}
    
    ${exercisesHtml}
    
    <div style="margin-top: var(--space-md); padding-top: var(--space-md); border-top: 1px solid var(--gray-200); font-size: 0.875rem; color: var(--gray-600);">
      <i class="fas fa-calendar"></i> ${FirebaseHelper.formatDate(assignment.assignedDate)}
    </div>
    
    ${!assignment.completed ? `
      <button class="btn btn-primary complete-btn" onclick="markAsComplete('${assignment.id}')">
        <i class="fas fa-check"></i> تحديد كمكتمل / Mark as Complete
      </button>
    ` : ''}
  `;

    return card;
}

async function markAsComplete(assignmentId) {
    if (!confirm('هل أنت متأكد من إتمام هذا التمرين؟ / Are you sure you completed this workout?')) {
        return;
    }

    const feedback = prompt('كيف كان التمرين؟ (اختياري) / How was the workout? (optional)');

    const result = await FirebaseHelper.completeAssignment(assignmentId, feedback);

    if (result.success) {
        alert('رائع! تم تحديث حالة التمرين / Great! Workout marked as completed');
        loadWorkouts(); // Reload workouts
    } else {
        alert('خطأ: ' + result.error);
    }
}

// ===================================
// Messaging
// ===================================

function loadMessages() {
    if (!trainerId) {
        console.warn('⚠️ Trainer ID not loaded yet, skipping message load');
        return;
    }

    // Unsubscribe from previous listener
    if (messageUnsubscribe) {
        messageUnsubscribe();
    }

    console.log('📱 Loading messages between client and trainer...', currentUser.uid, trainerId);

    messageUnsubscribe = FirebaseHelper.listenToMessages(currentUser.uid, trainerId, (messages) => {
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
        messageDiv.style.cssText = 'margin-bottom: var(--space-md); display: flex; gap: var(--space-sm);';

        if (msg.senderType === 'client') {
            messageDiv.style.flexDirection = 'row-reverse';
        }

        const bubble = document.createElement('div');
        bubble.style.cssText = `
      max-width: 70%;
      padding: var(--space-sm) var(--space-md);
      border-radius: var(--radius-md);
      ${msg.senderType === 'trainer' ?
                'background: var(--primary-blue); color: white;' :
                'background: white; color: var(--gray-900); box-shadow: var(--shadow-sm);'
            }
    `;

        bubble.innerHTML = `
      <p>${msg.message}</p>
      <div style="font-size: 0.75rem; opacity: 0.7; margin-top: var(--space-xs);">
        ${FirebaseHelper.formatDate(msg.timestamp)}
      </div>
    `;

        messageDiv.appendChild(bubble);
        thread.appendChild(messageDiv);
    });

    // Scroll to bottom
    thread.scrollTop = thread.scrollHeight;
}

async function handleSendMessage(e) {
    e.preventDefault();

    if (!trainerId) {
        alert('خطأ: لم يتم تحميل معلومات المدرب / Error: Trainer information not loaded');
        return;
    }

    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    if (!message) return;

    console.log('📤 Sending message to trainer:', trainerId);

    const result = await FirebaseHelper.sendMessage(
        currentUser.uid,
        trainerId,
        message,
        'client'
    );

    if (result.success) {
        messageInput.value = '';
        console.log('✅ Message sent successfully');
    } else {
        alert('خطأ في إرسال الرسالة: ' + result.error);
        console.error('❌ Message send failed:', result.error);
    }
}

// ===================================
// Tab Switching
// ===================================

function switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.borderBottom = '3px solid transparent';
        btn.style.color = 'var(--gray-600)';

        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
            btn.style.borderBottom = '3px solid var(--primary-blue)';
            btn.style.color = 'var(--primary-blue)';
        }
    });

    // Show/hide tab content
    document.getElementById('workoutsTab').style.display = tabName === 'workouts' ? 'block' : 'none';
    document.getElementById('messagesTab').style.display = tabName === 'messages' ? 'block' : 'none';
}
