// ===================================
// Firebase Configuration & Initialization
// ===================================

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyClpHr1Y_lKeAmb3Dfq2dXbZCYDbvNXPLk",
    authDomain: "fitlife-e5421.firebaseapp.com",
    projectId: "fitlife-e5421",
    storageBucket: "fitlife-e5421.firebasestorage.app",
    messagingSenderId: "81268099270",
    appId: "1:81268099270:web:f0a521d8dc42c9ec15afc7"
};

// Initialize Firebase (will be done when SDK is loaded)
let app;
let auth;
let db;

// Initialize Firebase after SDK loads
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded');
        return false;
    }

    try {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}

// ===================================
// Authentication Helpers
// ===================================

// Sign in with email and password
async function signIn(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign out
async function signOut() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get current user
function getCurrentUser() {
    return auth.currentUser;
}

// Check if user is authenticated
function isAuthenticated() {
    return auth.currentUser !== null;
}

// Listen for auth state changes
function onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
}

// ===================================
// Database Helpers - Clients
// ===================================

// Get all clients
async function getAllClients() {
    try {
        const snapshot = await db.collection('users').where('role', '==', 'client').get();
        const clients = [];
        snapshot.forEach(doc => {
            clients.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: clients };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get single client by ID
async function getClient(clientId) {
    try {
        const doc = await db.collection('users').doc(clientId).get();
        if (doc.exists) {
            return { success: true, data: { id: doc.id, ...doc.data() } };
        } else {
            return { success: false, error: 'Client not found' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Add new client
async function addClient(clientData) {
    try {
        const docRef = await db.collection('users').add({
            ...clientData,
            role: 'client',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Update client
async function updateClient(clientId, updates) {
    try {
        await db.collection('users').doc(clientId).update({
            ...updates,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===================================
// Database Helpers - Workouts
// ===================================

// Get all workout templates
async function getAllWorkouts() {
    try {
        const snapshot = await db.collection('workouts').get();
        const workouts = [];
        snapshot.forEach(doc => {
            workouts.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: workouts };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Add workout template
async function addWorkout(workoutData) {
    try {
        const docRef = await db.collection('workouts').add({
            ...workoutData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===================================
// Database Helpers - Assignments
// ===================================

// Assign workout to client
async function assignWorkout(clientId, workoutId, notes, dueDate) {
    try {
        const docRef = await db.collection('assignments').add({
            clientId,
            workoutId,
            trainerNotes: notes || '',
            assignedDate: firebase.firestore.FieldValue.serverTimestamp(),
            dueDate: dueDate || null,
            status: 'pending',
            completed: false
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get client's assignments
async function getClientAssignments(clientId) {
    try {
        const snapshot = await db.collection('assignments')
            .where('clientId', '==', clientId)
            .orderBy('assignedDate', 'desc')
            .get();

        const assignments = [];
        for (const doc of snapshot.docs) {
            const assignment = { id: doc.id, ...doc.data() };

            // Fetch workout details
            const workoutDoc = await db.collection('workouts').doc(assignment.workoutId).get();
            if (workoutDoc.exists) {
                assignment.workout = { id: workoutDoc.id, ...workoutDoc.data() };
            }

            assignments.push(assignment);
        }

        return { success: true, data: assignments };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Mark assignment as completed
async function completeAssignment(assignmentId, feedback) {
    try {
        await db.collection('assignments').doc(assignmentId).update({
            status: 'completed',
            completed: true,
            completedDate: firebase.firestore.FieldValue.serverTimestamp(),
            clientFeedback: feedback || ''
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===================================
// Database Helpers - Messages
// ===================================

// Send message
async function sendMessage(senderId, receiverId, message, senderType) {
    try {
        // Create conversation ID (consistent order)
        const conversationId = [senderId, receiverId].sort().join('_');

        const docRef = await db.collection('messages').add({
            conversationId,
            senderId,
            receiverId,
            senderType, // 'trainer' or 'client'
            message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            read: false
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get conversation messages
async function getMessages(userId1, userId2) {
    try {
        const conversationId = [userId1, userId2].sort().join('_');

        const snapshot = await db.collection('messages')
            .where('conversationId', '==', conversationId)
            .orderBy('timestamp', 'asc')
            .get();

        const messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, data: messages };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Listen for new messages in real-time
function listenToMessages(userId1, userId2, callback) {
    const conversationId = [userId1, userId2].sort().join('_');

    return db.collection('messages')
        .where('conversationId', '==', conversationId)
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            const messages = [];
            snapshot.forEach(doc => {
                messages.push({ id: doc.id, ...doc.data() });
            });
            callback(messages);
        });
}

// Mark messages as read
async function markMessagesAsRead(conversationId, userId) {
    try {
        const snapshot = await db.collection('messages')
            .where('conversationId', '==', conversationId)
            .where('receiverId', '==', userId)
            .where('read', '==', false)
            .get();

        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });

        await batch.commit();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ===================================
// Utility Functions
// ===================================

// Format timestamp to readable date
function formatDate(timestamp) {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) return 'الآن / Now';

    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} دقيقة / ${minutes} min ago`;
    }

    // Less than 1 day
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} ساعة / ${hours} hours ago`;
    }

    // Format as date
    return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Export for use in other files
window.FirebaseHelper = {
    initializeFirebase,
    signIn,
    signOut,
    getCurrentUser,
    isAuthenticated,
    onAuthStateChanged,
    getAllClients,
    getClient,
    addClient,
    updateClient,
    getAllWorkouts,
    addWorkout,
    assignWorkout,
    getClientAssignments,
    completeAssignment,
    sendMessage,
    getMessages,
    listenToMessages,
    markMessagesAsRead,
    formatDate
};
