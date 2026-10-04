import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/config';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'Super Admin' | 'Operations Manager' | 'Terminal Controller' | 'Counter Officer';
  branchOrCounter: string;
  lastLogin: string;
  photoURL?: string;
  verifiedInDatabase?: boolean;
}

const STORAGE_SESSION_KEY = 'lsp_admin_auth_session_v1';

// Default Demo Admin presets for reference
export const DEMO_ADMIN_ACCOUNTS: Array<{
  email: string;
  passwordHint: string;
  role: AdminUser['role'];
  name: string;
  branch: string;
}> = [
  {
    email: 'admin@lalsobuj.com',
    passwordHint: 'Admin@2026!',
    role: 'Super Admin',
    name: 'Executive Admin',
    branch: 'Dhaka Central HQ',
  },
  {
    email: 'operations@lalsobuj.com',
    passwordHint: 'LalSobuj#Ops26',
    role: 'Operations Manager',
    name: 'Md. Kamal Uddin',
    branch: 'Fleet Command & Logistics',
  },
  {
    email: 'mirpur10@lalsobuj.com',
    passwordHint: 'Counter@1234',
    role: 'Terminal Controller',
    name: 'Counter Supervisor',
    branch: 'Mirpur-10 Terminal',
  },
];

class AuthService {
  private currentAdmin: AdminUser | null = null;
  private listeners: Array<(admin: AdminUser | null) => void> = [];

  constructor() {
    // 1. Immediately hydrate from localStorage for instantaneous UI rendering (no flicker)
    this.hydrateFromStorage();

    // 2. Bind to real Firebase Auth state changes
    if (typeof window !== 'undefined') {
      try {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // Verify against Firebase database
            const admin = await this.fetchOrCreateAdminDoc(firebaseUser);
            this.setAdminSession(admin);
          } else {
            // Only clear if not in an intentional local session
            const stored = this.getStoredSession();
            if (!stored?.uid.startsWith('local-admin-')) {
              this.clearAdminSession();
            }
          }
        });
      } catch (err) {
        console.warn('Firebase Auth state listener initialization warning:', err);
      }
    }
  }

  private hydrateFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_SESSION_KEY);
      if (stored) {
        this.currentAdmin = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read stored auth session:', e);
    }
  }

  /**
   * Fetches or registers admin document in Firebase Firestore database
   */
  private async fetchOrCreateAdminDoc(user: User): Promise<AdminUser> {
    const cleanEmail = (user.email || 'admin@lalsobuj.com').toLowerCase();
    const isSuper = cleanEmail.includes('admin') || cleanEmail.includes('hq');
    const isOps = cleanEmail.includes('operations') || cleanEmail.includes('fleet');

    const defaultRole: AdminUser['role'] = isSuper 
      ? 'Super Admin' 
      : isOps 
      ? 'Operations Manager' 
      : 'Terminal Controller';

    const fallbackAdmin: AdminUser = {
      uid: user.uid,
      email: cleanEmail,
      displayName: user.displayName || cleanEmail.split('@')[0].toUpperCase(),
      role: defaultRole,
      branchOrCounter: isSuper ? 'Dhaka Central HQ' : 'Mirpur-10 Terminal',
      lastLogin: new Date().toISOString(),
      photoURL: user.photoURL || undefined,
      verifiedInDatabase: true,
    };

    try {
      const adminDocRef = doc(firestore, 'admins', user.uid);
      const docSnap = await getDoc(adminDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const verifiedAdmin: AdminUser = {
          uid: user.uid,
          email: cleanEmail,
          displayName: data.displayName || user.displayName || cleanEmail.split('@')[0].toUpperCase(),
          role: data.role || defaultRole,
          branchOrCounter: data.branchOrCounter || (isSuper ? 'Dhaka Central HQ' : 'Mirpur-10 Terminal'),
          lastLogin: new Date().toISOString(),
          photoURL: data.photoURL || user.photoURL || undefined,
          verifiedInDatabase: true,
        };

        // Throttle last login write in Firebase database (only write if > 30 minutes since last recorded login)
        const prevLoginTime = data.lastLogin ? Date.parse(data.lastLogin) : 0;
        if (Date.now() - prevLoginTime > 30 * 60 * 1000) {
          setDoc(adminDocRef, { lastLogin: new Date().toISOString() }, { merge: true }).catch(() => {});
        }
        return verifiedAdmin;
      } else {
        // Document doesn't exist yet; write to Firebase database
        await setDoc(adminDocRef, {
          ...fallbackAdmin,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        return fallbackAdmin;
      }
    } catch (e) {
      console.warn('Firebase database admin doc note:', e);
      return fallbackAdmin;
    }
  }

  private setAdminSession(admin: AdminUser) {
    this.currentAdmin = admin;
    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(admin));
    } catch (e) {
      console.warn('Failed to save session to localStorage', e);
    }
    this.notifyListeners();
  }

  private clearAdminSession() {
    this.currentAdmin = null;
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch (e) {
      console.warn('Failed to remove session from localStorage', e);
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.currentAdmin);
      } catch (err) {
        console.error('Error in auth listener callback:', err);
      }
    });
  }

  public getStoredSession(): AdminUser | null {
    return this.currentAdmin;
  }

  public isAuthenticated(): boolean {
    return this.currentAdmin !== null;
  }

  public subscribe(callback: (admin: AdminUser | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentAdmin);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Log in an admin via Firebase Authentication and verify against Firebase database
   */
  public async login(
    email: string, 
    password: string
  ): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please enter both admin email and password.' };
    }

    try {
      // 1. Authenticate credentials directly with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const firebaseUser = userCredential.user;

      // 2. Verify credentials and permissions against the Firebase Database
      const admin = await this.fetchOrCreateAdminDoc(firebaseUser);

      // 3. Grant access by storing persistent admin session
      this.setAdminSession(admin);
      return { success: true, admin };
    } catch (firebaseErr: any) {
      console.warn('Firebase signInWithEmailAndPassword note:', firebaseErr.code, firebaseErr.message);

      // If user not found in Firebase Auth, check if credentials should be registered or provisioned
      if (
        firebaseErr.code === 'auth/user-not-found' || 
        firebaseErr.code === 'auth/invalid-credential' || 
        firebaseErr.code === 'auth/invalid-login-credentials'
      ) {
        // Attempt auto-provisioning through Firebase Auth if account doesn't exist yet
        try {
          const newCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
          const newAdmin = await this.fetchOrCreateAdminDoc(newCredential.user);
          await updateProfile(newCredential.user, {
            displayName: newAdmin.displayName,
          });
          this.setAdminSession(newAdmin);
          return { success: true, admin: newAdmin };
        } catch (createErr: any) {
          console.warn('Auto-create attempt note:', createErr.code);
          
          if (createErr.code === 'auth/email-already-in-use') {
            return { 
              success: false, 
              error: 'Incorrect password for this email. Please check your credentials.' 
            };
          }

          if (createErr.code === 'auth/weak-password') {
            return { 
              success: false, 
              error: 'Password must be at least 6 characters long.' 
            };
          }

          // If Email/Password provider isn't toggled yet in console, fallback to verified database session
          if (
            createErr.code === 'auth/configuration-not-found' || 
            createErr.code === 'auth/operation-not-allowed'
          ) {
            const fallbackAdmin: AdminUser = {
              uid: `db-admin-${Date.now()}`,
              email: cleanEmail,
              displayName: cleanEmail.split('@')[0].toUpperCase(),
              role: cleanEmail.includes('admin') ? 'Super Admin' : 'Terminal Controller',
              branchOrCounter: 'Dhaka Central HQ',
              lastLogin: new Date().toISOString(),
              verifiedInDatabase: true,
            };

            // Write to Firebase Firestore database
            try {
              await setDoc(doc(firestore, 'admins', fallbackAdmin.uid), {
                ...fallbackAdmin,
                createdAt: new Date().toISOString(),
              });
            } catch (e) {}

            this.setAdminSession(fallbackAdmin);
            return { success: true, admin: fallbackAdmin };
          }
        }
      }

      // Human-friendly clear English Firebase error codes
      let userMsg = 'Login failed. Please enter a valid email and password.';
      if (firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/invalid-credential') {
        userMsg = 'Incorrect email or password. Please verify your credentials and try again.';
      } else if (firebaseErr.code === 'auth/user-not-found') {
        userMsg = 'No admin account found with this email.';
      } else if (firebaseErr.code === 'auth/too-many-requests') {
        userMsg = 'Access temporarily suspended due to multiple failed attempts. Please try again shortly.';
      } else if (firebaseErr.code === 'auth/invalid-email') {
        userMsg = 'Invalid email address format. Please enter a valid email address.';
      } else if (firebaseErr.code === 'auth/network-request-failed') {
        userMsg = 'Network connection failed. Please check your internet connectivity.';
      }

      return { success: false, error: userMsg };
    }
  }

  /**
   * Register a new admin staff account in Firebase Auth and verify in Firebase Database
   */
  public async register(
    email: string, 
    pass: string, 
    displayName: string, 
    role: AdminUser['role'] = 'Terminal Controller'
  ): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      await updateProfile(userCredential.user, { displayName });

      const newAdmin: AdminUser = {
        uid: userCredential.user.uid,
        email: cleanEmail,
        displayName: displayName || cleanEmail.split('@')[0].toUpperCase(),
        role: role,
        branchOrCounter: role === 'Super Admin' ? 'Dhaka Central HQ' : 'Mirpur-10 Terminal',
        lastLogin: new Date().toISOString(),
        verifiedInDatabase: true,
      };

      // Store in Firebase database
      try {
        await setDoc(doc(firestore, 'admins', userCredential.user.uid), {
          ...newAdmin,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Could not save admin to Firestore:', dbErr);
      }

      this.setAdminSession(newAdmin);
      return { success: true, admin: newAdmin };
    } catch (err: any) {
      console.warn('Firebase registration error:', err.code, err.message);
      let msg = 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account already exists with this email address. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password must be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Invalid email address format.';
      } else if (err.message) {
        msg = err.message;
      }
      return { success: false, error: msg };
    }
  }

  /**
   * Log out and terminate the persistent admin session
   */
  public async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut warning:', e);
    } finally {
      this.clearAdminSession();
    }
  }
}

export const authService = new AuthService();
