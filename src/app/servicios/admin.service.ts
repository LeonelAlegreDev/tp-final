import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, DocumentReference, CollectionReference, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Admin } from '../interfaces/admin';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private firestore: Firestore = inject(Firestore);
  private adminCollectionRef: CollectionReference;
  admins$: Observable<Admin[]>;

  constructor() {
    // Obtiene una referencia a la colección de especialistas
    this.adminCollectionRef = collection(this.firestore, 'admins');

    // Se obtienen el documento como observable
    this.admins$ = collectionData(this.adminCollectionRef) as Observable<Admin[]>;
  }

  async Create(admin: Admin): Promise<string> {
    try {
      // Crea una referencia y guarda el documento con el ID especificado
      const docRef = doc(this.adminCollectionRef, admin.id);
      await setDoc(docRef, admin); 

      return docRef.id;
    }
    catch (error) {
      console.error('Error al guardar el admin en la base de datos');
      throw error;
    }
  }

  async GetById(id: string): Promise<Admin | null> {
    return new Promise((resolve, reject) => {
      this.admins$.subscribe({
        next: (admins) => {
          const admin = admins.find(e => e.id === id);
          if (admin) {
            resolve(admin);
          } else {
            console.log('Administrador no encontrado');
            resolve(null);
          }
        },
        error: (error) => {
          console.error('Error al obtener admin:', error);
          reject(error);
        }
      });
    });
  }
}