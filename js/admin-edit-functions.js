// ===================================
// Edit & Management Functions
// Admin Dashboard Extensions
// ===================================

// Global vars for editing
let currentClientForEdit = null;
let currentWorkoutForEdit = null;
let editExerciseCount = 0;

// ===================================
// Edit Client
// ===================================

async function openEditClientModal(clientId) {
    const result = await FirebaseHelper.getClient(clientId);

    if (result.success) {
        currentClientForEdit = result.data;

        // Fill form with current data
        document.getElementById('editClientId').value = clientId;
        document.getElementById('editClientName').value = result.data.name;
        document.getElementById('editClientEmail').value = result.data.email;
        document.getElementById('editClientPhone').value = result.data.phone || '';
        document.getElementById('editClientPackage').value = result.data.package || 'basic';

        // Open modal
        document.getElementById('editClientModal').classList.add('active');
    } else {
        alert('خطأ في تحميل بيانات المتدرب: ' + result.error);
    }
}

function closeEditClientModal() {
    document.getElementById('editClientModal').classList.remove('active');
    document.getElementById('editClientForm').reset();
    currentClientForEdit = null;
}

async function handleEditClient(e) {
    e.preventDefault();

    const clientId = document.getElementById('editClientId').value;
    const updates = {
        name: document.getElementById('editClientName').value,
        email: document.getElementById('editClientEmail').value,
        phone: document.getElementById('editClientPhone').value,
        package: document.getElementById('editClientPackage').value
    };

    const result = await FirebaseHelper.updateClient(clientId, updates);

    if (result.success) {
        alert('✅ تم تحديث بيانات المتدرب بنجاح! / Client updated successfully!');
        closeEditClientModal();
        loadClients(); // Reload client list

        // If client modal is open, refresh it
        if (currentClientId === clientId) {
            const refreshResult = await FirebaseHelper.getClient(clientId);
            if (refreshResult.success) {
                displayClientInfo(refreshResult.data);
            }
        }
    } else {
        alert('خطأ في التحديث: ' + result.error);
    }
}

// ===================================
// Edit Workout
// ===================================

async function openEditWorkoutModal(workoutId) {
    const result = await FirebaseHelper.getWorkout(workoutId);

    if (result.success) {
        currentWorkoutForEdit = result.data;

        // Fill form with current data
        document.getElementById('editWorkoutId').value = workoutId;
        document.getElementById('editWorkoutTitleAr').value = result.data.titleAr || '';
        document.getElementById('editWorkoutTitleEn').value = result.data.title || '';
        document.getElementById('editWorkoutDifficulty').value = result.data.difficulty || 'beginner';
        document.getElementById('editWorkoutDuration').value = result.data.duration || 30;

        // Load exercises
        const container = document.getElementById('editExercisesContainer');
        container.innerHTML = '';
        editExerciseCount = 0;

        if (result.data.exercises && result.data.exercises.length > 0) {
            result.data.exercises.forEach(exercise => {
                addEditExerciseField(exercise);
            });
        } else {
            // Add one empty exercise if none exist
            addEditExerciseField();
        }

        // Open modal
        document.getElementById('editWorkoutModal').classList.add('active');
    } else {
        alert('خطأ في تحميل التمرين: ' + result.error);
    }
}

function closeEditWorkoutModal() {
    document.getElementById('editWorkoutModal').classList.remove('active');
    document.getElementById('editWorkoutForm').reset();
    document.getElementById('editExercisesContainer').innerHTML = '';
    currentWorkoutForEdit = null;
    editExerciseCount = 0;
}

function addEditExerciseField(exerciseData = null) {
    editExerciseCount++;
    const container = document.getElementById('editExercisesContainer');

    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-field';
    exerciseDiv.innerHTML = `
        <div class="card" style="margin-bottom: var(--space-md); padding: var(--space-md); background: var(--gray-50);">
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-sm);">
                <h4>تمرين ${editExerciseCount} / Exercise ${editExerciseCount}</h4>
                <button type="button" class="btn-icon" onclick="removeEditExercise(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">الاسم بالعربي</label>
                    <input type="text" class="edit-ex-name-ar form-input" value="${exerciseData ? exerciseData.nameAr || '' : ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">English Name</label>
                    <input type="text" class="edit-ex-name-en form-input" value="${exerciseData ? exerciseData.name || '' : ''}" required>
                </div>
            </div>
            
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Sets</label>
                    <input type="number" class="edit-ex-sets form-input" value="${exerciseData ? exerciseData.sets || 3 : 3}" required min="1">
                </div>
                <div class="form-group">
                    <label class="form-label">Reps</label>
                    <input type="number" class="edit-ex-reps form-input" value="${exerciseData ? exerciseData.reps || 10 : 10}" required min="1">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">ملاحظات / Notes</label>
                <textarea class="edit-ex-notes form-textarea" rows="2">${exerciseData ? exerciseData.notes || '' : ''}</textarea>
            </div>
        </div>
    `;

    container.appendChild(exerciseDiv);
}

function removeEditExercise(button) {
    button.closest('.exercise-field').remove();
}

async function handleEditWorkout(e) {
    e.preventDefault();

    const workoutId = document.getElementById('editWorkoutId').value;

    // Collect exercises
    const exercises = [];
    const exerciseFields = document.querySelectorAll('#editExercisesContainer .exercise-field');

    exerciseFields.forEach((field) => {
        const nameAr = field.querySelector('.edit-ex-name-ar').value;
        const nameEn = field.querySelector('.edit-ex-name-en').value;
        const sets = parseInt(field.querySelector('.edit-ex-sets').value);
        const reps = parseInt(field.querySelector('.edit-ex-reps').value);
        const notes = field.querySelector('.edit-ex-notes').value;

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

    // Updates
    const updates = {
        title: document.getElementById('editWorkoutTitleEn').value,
        titleAr: document.getElementById('editWorkoutTitleAr').value,
        difficulty: document.getElementById('editWorkoutDifficulty').value,
        duration: parseInt(document.getElementById('editWorkoutDuration').value),
        exercises: exercises
    };

    const result = await FirebaseHelper.updateWorkout(workoutId, updates);

    if (result.success) {
        alert('✅ تم تحديث التمرين بنجاح! / Workout updated successfully!');
        closeEditWorkoutModal();
        loadWorkouts(); // Reload workouts
    } else {
        alert('خطأ في التحديث: ' + result.error);
    }
}

// ===================================
// Trainer Management
// ===================================

async function loadTrainers() {
    const grid = document.getElementById('trainersGrid');
    grid.innerHTML = '<p>جاري التحميل... / Loading...</p>';

    const result = await FirebaseHelper.getUsersByRole('trainer');

    if (result.success) {
        if (result.data.length === 0) {
            grid.innerHTML = '<p>لا يوجد مدربين / No trainers yet</p>';
            return;
        }

        grid.innerHTML = '';
        result.data.forEach(trainer => {
            grid.appendChild(createTrainerCard(trainer));
        });
    } else {
        grid.innerHTML = `<p>خطأ في تحميل البيانات: ${result.error}</p>`;
    }
}

function createTrainerCard(trainer) {
    const card = document.createElement('div');
    card.className = 'client-card';

    const initials = trainer.name.split(' ').map(n => n[0]).join('').toUpperCase();

    card.innerHTML = `
        <div class="client-header">
            <div class="client-avatar" style="background: linear-gradient(135deg, var(--secondary-green), var(--accent-orange));">${initials}</div>
            <div class="client-info">
                <h3>${trainer.name}</h3>
                <span class="client-status status-${trainer.status}">${trainer.status}</span>
            </div>
        </div>
        <div style="margin-top: var(--space-md); padding-top: var(--space-md); border-top: 1px solid var(--gray-200);">
            <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: var(--space-xs);">
                <i class="fas fa-envelope"></i> ${trainer.email}
            </p>
            ${trainer.phone ? `<p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: var(--space-xs);">
                <i class="fas fa-phone"></i> ${trainer.phone}
            </p>` : ''}
            <p style="font-size: 0.875rem; color: var(--gray-600);">
                <i class="fas fa-user-tie"></i> Trainer / مدرب
            </p>
        </div>
    `;

    return card;
}

function openAddTrainerModal() {
    document.getElementById('addTrainerModal').classList.add('active');
}

function closeAddTrainerModal() {
    document.getElementById('addTrainerModal').classList.remove('active');
    document.getElementById('addTrainerForm').reset();
}

async function handleAddTrainer(e) {
    e.preventDefault();

    const name = document.getElementById('trainerName').value;
    const email = document.getElementById('trainerEmail').value;
    const password = document.getElementById('trainerPassword').value;
    const phone = document.getElementById('trainerPhone').value;

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإنشاء... / Creating...';
    submitBtn.disabled = true;

    try {
        // Call Cloud Function to create trainer
        const createTrainer = firebase.functions().httpsCallable('createTrainer');

        const result = await createTrainer({
            name: name,
            email: email,
            password: password,
            phone: phone
        });

        if (result.data.success) {
            alert(`✅ ${result.data.message}\n\nUID: ${result.data.uid}\n\nيمكن للمدرب تسجيل الدخول الآن بـ:\nEmail: ${email}\nPassword: ${password}\n\n⚠️ يُفضل إرسال بيانات الدخول للمدرب عبر وسيلة آمنة`);
            closeAddTrainerModal();
            loadTrainers();
        }
    } catch (error) {
        console.error('Error calling Cloud Function:', error);

        let errorMessage = 'حدث خطأ أثناء إنشاء الحساب / An error occurred';

        if (error.code === 'functions/unauthenticated') {
            errorMessage = 'يجب تسجيل الدخول أولاً / Must be authenticated';
        } else if (error.code === 'functions/permission-denied') {
            errorMessage = 'فقط الأدمن يمكنه إضافة مدربين / Only admins can create trainers';
        } else if (error.code === 'functions/already-exists') {
            errorMessage = 'البريد الإلكتروني مستخدم بالفعل / Email already exists';
        } else if (error.code === 'functions/invalid-argument') {
            errorMessage = error.message;
        } else if (error.code === 'functions/not-found') {
            errorMessage = '❌ Cloud Function غير متاح!\n\nيجب نشر Cloud Functions أولاً.\nاتبع التعليمات في CLOUD_FUNCTIONS_SETUP.md';
        } else {
            errorMessage = error.message || errorMessage;
        }

        alert('❌ ' + errorMessage);
    } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ===================================
// Update UI for Admin Features
// ===================================

function updateUIForRole(role) {
    const createWorkoutBtn = document.getElementById('createWorkoutBtn');
    const trainersMenuItem = document.getElementById('trainersMenuItem');

    if (role === 'admin') {
        // Admin can create workouts and manage trainers
        if (createWorkoutBtn) {
            createWorkoutBtn.style.display = 'inline-flex';
        }
        if (trainersMenuItem) {
            trainersMenuItem.style.display = 'block';
        }
        console.log('👑 Admin mode activated - Full access');
    } else {
        // Trainer - limited features
        if (createWorkoutBtn) {
            createWorkoutBtn.style.display = 'none';
        }
        if (trainersMenuItem) {
            trainersMenuItem.style.display = 'none';
        }
        console.log('👨‍🏫 Trainer mode activated - Limited access');
    }
}

// ===================================
// View Switching Updates  
// ===================================

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
    document.getElementById('trainersView').style.display = viewName === 'trainers' ? 'block' : 'none';

    // Load data for the view
    if (viewName === 'trainers') {
        loadTrainers();
    }
}

// ===================================
// Event Listeners Setup
// ===================================

// Setup all new event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Edit client form
    document.getElementById('editClientForm')?.addEventListener('submit', handleEditClient);

    // Edit workout form
    document.getElementById('editWorkoutForm')?.addEventListener('submit', handleEditWorkout);

    // Add trainer button & form
    document.getElementById('addTrainerBtn')?.addEventListener('click', openAddTrainerModal);
    document.getElementById('addTrainerForm')?.addEventListener('submit', handleAddTrainer);
});
