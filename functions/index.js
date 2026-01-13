const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Cloud Function to create trainer account
 * Called from admin dashboard
 * Creates user in Authentication AND Firestore
 */
exports.createTrainer = functions.https.onCall(async (data, context) => {
    // Verify that the user is authenticated and is an admin
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'المستخدم غير مصرح له / User must be authenticated'
        );
    }

    try {
        // Check if caller is admin
        const callerDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();

        if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
            throw new functions.https.HttpsError(
                'permission-denied',
                'فقط الأدمن يمكنه إضافة مدربين / Only admins can create trainers'
            );
        }

        // Validate input
        const { name, email, password, phone } = data;

        if (!name || !email || !password) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'يجب توفير الاسم والبريد الإلكتروني وكلمة المرور / Name, email, and password are required'
            );
        }

        if (password.length < 6) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'كلمة المرور يجب أن تكون 6 أحرف على الأقل / Password must be at least 6 characters'
            );
        }

        // Create user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: name,
            emailVerified: false
        });

        console.log('Successfully created trainer in Auth:', userRecord.uid);

        // Create user document in Firestore
        await admin.firestore().collection('users').doc(userRecord.uid).set({
            name: name,
            email: email,
            phone: phone || '',
            role: 'trainer',
            status: 'active',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: context.auth.uid
        });

        console.log('Successfully created trainer in Firestore:', userRecord.uid);

        // Return success with user info
        return {
            success: true,
            uid: userRecord.uid,
            email: email,
            name: name,
            message: 'تم إنشاء حساب المدرب بنجاح! / Trainer account created successfully!'
        };

    } catch (error) {
        console.error('Error creating trainer:', error);

        // Handle specific Firebase Auth errors
        if (error.code === 'auth/email-already-exists') {
            throw new functions.https.HttpsError(
                'already-exists',
                'البريد الإلكتروني مستخدم بالفعل / Email already exists'
            );
        }

        if (error.code === 'auth/invalid-email') {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'البريد الإلكتروني غير صحيح / Invalid email address'
            );
        }

        if (error.code === 'auth/weak-password') {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'كلمة المرور ضعيفة جداً / Password is too weak'
            );
        }

        // Re-throw HttpsErrors
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }

        // Generic error
        throw new functions.https.HttpsError(
            'internal',
            'حدث خطأ أثناء إنشاء الحساب / An error occurred: ' + error.message
        );
    }
});

/**
 * Optional: Cloud Function to delete trainer
 * Admin only
 */
exports.deleteTrainer = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
        // Check if caller is admin
        const callerDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();

        if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
            throw new functions.https.HttpsError('permission-denied', 'Only admins can delete trainers');
        }

        const { uid } = data;

        if (!uid) {
            throw new functions.https.HttpsError('invalid-argument', 'Trainer UID is required');
        }

        // Delete from Authentication
        await admin.auth().deleteUser(uid);

        // Delete from Firestore
        await admin.firestore().collection('users').doc(uid).delete();

        return {
            success: true,
            message: 'Trainer deleted successfully'
        };

    } catch (error) {
        console.error('Error deleting trainer:', error);
        throw new functions.https.HttpsError('internal', 'An error occurred: ' + error.message);
    }
});
