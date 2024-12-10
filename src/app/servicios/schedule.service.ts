import { inject, Injectable } from '@angular/core';
import { collection, CollectionReference, Firestore, DocumentData, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Schedule } from '../interfaces/schedule';
import { collectionData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private firestore: Firestore = inject(Firestore);
  private scheduleCollectionRef: CollectionReference<DocumentData>;
  schedule$: Observable<Schedule[]>;

  constructor() { 
    this.scheduleCollectionRef = collection(this.firestore, 'schedules');

    this.schedule$ = collectionData(this.scheduleCollectionRef) as Observable<Schedule[]>;
  }

  async Create(schedule: Schedule, especialistaId: string): Promise<string> {
    try {
      const docRef = doc(this.scheduleCollectionRef, especialistaId);
      await setDoc(docRef, schedule);

      return docRef.id;
    }
    catch (error) {
      console.error('Error al guardar el schedule en la base de datos');
      throw error;
    }
  }  

  async Update(schedule: Schedule, especialistaId: string): Promise<void> {
    try {
      const docRef = doc(this.scheduleCollectionRef, especialistaId);
      await setDoc(docRef, schedule);
    }
    catch (error) {
      console.error('Error al actualizar el schedule en la base de datos');
      throw error;
    }
  }

}
