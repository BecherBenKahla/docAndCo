import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, Observable } from 'rxjs';
import { Person, Specialty, Structure } from 'src/app/common';

@Injectable({
  providedIn: 'root'
})
export class AdvancedSearchService {

  constructor(private http: HttpClient) { }

  getPersons(): Observable<Person[]> {
    let personsDocumentPath = 'assets/data/persons.json'
    return this.http.get<Person[]>(personsDocumentPath).pipe(
      first(),
    );
  }

  getStructures(): Observable<Structure[]> {
    let structuresDocumentPath = 'assets/data/structures.json'
    return this.http.get<Structure[]>(structuresDocumentPath).pipe(
      first(),
    );
  }

  getSpecialities(): Observable<Specialty[]> {
    let specialitiesDocumentPath = 'assets/data/structures.json'
    return this.http.get<Specialty[]>(specialitiesDocumentPath).pipe(
      first(),
    );
  }




}
