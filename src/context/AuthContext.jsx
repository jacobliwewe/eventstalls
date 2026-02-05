import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Fetch user data from Firestore to get role
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                let userData = {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    name: currentUser.displayName || currentUser.email.split('@')[0],
                    emailVerified: currentUser.emailVerified,
                    role: 'user' // Default role
                };

                if (userDocSnap.exists()) {
                    userData = { ...userData, ...userDocSnap.data() };
                }

                setUser(userData);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email, password, name) => {
        try {
            console.log("Starting signup process for:", email);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("User created in Auth:", user.uid);

            // Update profile with name
            await updateProfile(user, {
                displayName: name
            });
            console.log("Profile updated with name:", name);

            // Create user document in Firestore
            try {
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    name: name,
                    email: email,
                    role: 'user', // Default role
                    createdAt: new Date().toISOString()
                });
                console.log("User document created in Firestore");
            } catch (firestoreError) {
                console.error("Error creating Firestore document:", firestoreError);
                // We don't throw here to ensure the user can still log in even if Firestore fails
                // But we should probably alert the user or handle this better in a real app
                throw firestoreError;
            }

            return user;
        } catch (error) {
            console.error("Signup failed:", error);
            throw error;
        }
    };

    const logout = () => {
        return signOut(auth);
    };

    const updateUserData = async (updates) => {
        if (!user) return;

        try {
            // Update Firebase Auth profile if name or photoURL is provided
            if (updates.name || updates.photoURL) {
                const profileUpdates = {};
                if (updates.name) profileUpdates.displayName = updates.name;
                if (updates.photoURL) profileUpdates.photoURL = updates.photoURL;
                await updateProfile(auth.currentUser, profileUpdates);
            }

            // Update Firestore document
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                ...updates,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            // Update local state
            setUser(prev => ({ ...prev, ...updates }));
            return true;
        } catch (error) {
            console.error("Update user data failed:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateUserData, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
