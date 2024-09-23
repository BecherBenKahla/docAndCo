import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { first, map, Observable } from 'rxjs';
import { Person, Specialty, Structure } from 'src/app/common';
import { Location } from 'src/app/common/models/location.model';

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
    let specialitiesDocumentPath = 'assets/data/specialties.json'
    return this.http.get<Specialty[]>(specialitiesDocumentPath).pipe(
      first(),
    );
  }

  getLocations(): Observable<Location[]> {
    return this.getStructures().pipe(
      map((structures: Structure[]) => {
        // Map to locations
        const locations = structures.map(structure => ({
          postalCode: structure.postalCode ? structure.postalCode.toString() : '',
          city: structure.city || ''
        }));

        // Remove duplicates by filtering unique postalCode and city combinations
        const uniqueLocations = locations.filter((location, index, self) =>
          index === self.findIndex(
            loc => loc.postalCode === location.postalCode && loc.city === location.city
          )
        );
        return uniqueLocations;
      })
    );
  }

    getDepartements(): Observable<Departement[]> {
    let departementsDocumentPath = 'assets/data/departements-region.json';
  
    return this.http.get<Departement[]>(departementsDocumentPath).pipe(
      map((departements: Departement[]) => {
        return departements.map(departement => ({
          ...departement,
          num_dep: departement.num_dep.toString()  // Ensure num_dep is a string
        }));
      }),
      first()  // Complete the observable after the first emission
    );
  }
}
