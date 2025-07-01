import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, DocumentReference, CollectionReference, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Paciente } from '../interfaces/paciente';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private firestore: Firestore = inject(Firestore); // inject Cloud Firestore
  private pacientesCollectionRef: CollectionReference;
  pacientes$: Observable<Paciente[]>;

  constructor() { 
    // get a reference to the user-profile collection
    this.pacientesCollectionRef = collection(this.firestore, 'pacientes');

    // get documents (data) from the collection using collectionData
    this.pacientes$ = collectionData(this.pacientesCollectionRef) as Observable<Paciente[]>;
  }

  async Create(paciente: Paciente): Promise<string> {
    try {
      // Crea una referencia al documento con el ID especificado
      const docRef = doc(this.pacientesCollectionRef, paciente.id);
      // Usa setDoc para crear el documento con los datos del paciente
      await setDoc(docRef, paciente);
      return docRef.id;
    }
    catch (error) {
      console.error('Error al guardar el paciente en la base de datos');
      throw error;
    }
  }

  async GetById(id: string): Promise<Paciente | null> {
    return new Promise((resolve, reject) => {
      this.pacientes$.subscribe({
        next: (pacientes) => {
          const paciente = pacientes.find(p => p.id === id);
          if (paciente) {
            resolve(paciente);
          } else {
            console.log('Paciente no encontrado');
            resolve(null);
          }
        },
        error: (error) => {
          console.error('Error al obtener pacientes:', error);
          reject(error);
        }
      });
    });
  }

  async DeletePaciente(id: string): Promise<void> {
    try {
      // Crea una referencia al documento del paciente
      const docRef = doc(this.pacientesCollectionRef, id);
      // Elimina el documento
      await setDoc(docRef, {}, { merge: true });
      console.log('Paciente eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar el paciente:', error);
      throw error;
    }
  }
}
