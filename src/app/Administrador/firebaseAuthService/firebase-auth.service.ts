import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, updatePassword, deleteUser } from '@angular/fire/auth';
import { Firestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from '@angular/fire/firestore';
import { toast } from 'ngx-sonner';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {

  constructor(private auth: Auth, private firestore: Firestore) {}

  getUsers(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'users');
    return from(getDocs(usersCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})))
    );
  }

  async createUser(email: string, password: string): Promise<void> {
    try {
        const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
        if (userCredential.user) {
          await addDoc(collection(this.firestore, 'users'), {
            email: email,
            disabled: false
          });
        }
      } catch (error) {
        toast.error('Error al crear un usuario');
        // console.error('Error creating user:', error);
        throw error;
      }
  }

  async updatePassword(uid: string, newPassword: string): Promise<void> {
    try {
      const user = this.auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
      } else {
        throw new Error('No user is currently signed in');
      }
    } catch (error) {
        toast.error('Error al actualizar la contraseña');
    //   console.error('Error updating password:', error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'users', uid));
      const user = this.auth.currentUser;
      if (user) {
        await deleteUser(user);
      }
    } catch (error) {
        toast.error('Error al eliminar un usuario');
    //   console.error('Error deleting user:', error);
      throw error;
    }
  }

  async disableUser(uid: string, disable: boolean): Promise<void> {
    try {
      const userDoc = doc(this.firestore, 'users', uid);
      await updateDoc(userDoc, { disabled: disable });
      // Note: Actually disabling the user in Firebase Auth requires Firebase Admin SDK on the server-side
    } catch (error) {
        toast.error('Error al deshabilitar un usuario');
    //   console.error('Error disabling user:', error);
      throw error;
    }
  }
}
