import { Injectable } from '@angular/core';
import { Component, inject } from '@angular/core';
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
      const docRef = doc(this.pacientesCollectionRef, paciente.id); // Crea una referencia al documento con el ID especificado
      await setDoc(docRef, paciente); // Usa setDoc para crear el documento con los datos del paciente

      return docRef.id;
    }
    catch (error) {
      console.error('Error al guardar el paciente en la base de datos');
      throw error;
    }
  }
}
