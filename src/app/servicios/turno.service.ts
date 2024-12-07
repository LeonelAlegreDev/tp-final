import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Turno } from '../interfaces/turno';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private firestore: Firestore = inject(Firestore);
  private turnosCollectionRef: CollectionReference;
  turnos$: Observable<Turno[]>;

  constructor() {
    // Obtiene una referencia a la colección de turnos
    this.turnosCollectionRef = collection(this.firestore, 'turnos');
  
    this.turnos$ = collectionData(this.turnosCollectionRef) as Observable<Turno[]>;
  }

  async Create(turno: Turno): Promise<string> {
    try {
      // Crea una referencia y guarda el documento con el ID especificado
      const docRef = await addDoc(this.turnosCollectionRef, turno);
      return docRef.id;
    }
    catch (error) {
      console.error('Error al guardar el turno en la base de datos');
      throw error;
    }
  }
}
