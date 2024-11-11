import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, DocumentReference, CollectionReference, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Especialista } from '../interfaces/especialista';
import { Especialidad } from '../interfaces/especialidad';


@Injectable({
  providedIn: 'root'
})
export class EspecialistaService {
  private firestore: Firestore = inject(Firestore);
  private especialistasCollectionRef: CollectionReference;
  private tipoEspecialistaCollectionRef: CollectionReference;
  especialistas$: Observable<Especialista[]>;
  tipoEspecialista$: Observable<Especialidad>;

  constructor() { 
    // Obtiene una referencia a la colección de especialistas
    this.especialistasCollectionRef = collection(this.firestore, 'especialistas');

    // Obtiene una referencia a la colección de tipos de especialistas
    this.tipoEspecialistaCollectionRef = collection(this.firestore, 'tipoEspecialista');

    // Se obtienen los documentos como observables
    this.especialistas$ = collectionData(this.especialistasCollectionRef) as Observable<Especialista[]>;
    this.tipoEspecialista$ = collectionData(this.tipoEspecialistaCollectionRef) as Observable<Especialidad>;
  }

  async Create(especialista: Especialista): Promise<string> {
    try {
      // Crea una referencia y guarda el documento con el ID especificado
      const docRef = doc(this.especialistasCollectionRef, especialista.id);
      await setDoc(docRef, especialista); 

      return docRef.id;
    }
    catch (error) {
      console.error('Error al guardar el especialista en la base de datos');
      throw error;
    }
  }

  async CreateTipoEspecialista(especialidad: Especialidad): Promise<void> {
    try {
       // Guarda el tipo de especialista en la base de datos y obtiene la referencia del documento
      const docRef = await addDoc(this.tipoEspecialistaCollectionRef, especialidad);

      // Actualiza el documento con el ID generado automáticamente
      await setDoc(docRef, { ...especialidad, id: docRef.id }, { merge: true });

    }
    catch (error) {
      console.error('Error al guardar el tipo de especialista en la base de datos');
      throw error;
    }
  }
}
