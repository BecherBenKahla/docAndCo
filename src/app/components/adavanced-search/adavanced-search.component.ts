import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { combineLatest, finalize, first, tap } from 'rxjs';
import { AdvancedSearchService } from 'src/app/services/advanced-search/advanced-search.service';

export interface Chip {
  name: string;
  whoAreaUsed: boolean,
  whereAreaUsed: boolean,
  whoSearchText: string,
  whereSearchText: string,
  sectionUsed: string,
  showDetail: boolean,
  dataPerson: any;
  idSpeciality: number;
  selectedHospitalData: any;
}

@Component({
  selector: 'app-adavanced-search',
  templateUrl: './adavanced-search.component.html',
  styleUrls: ['./adavanced-search.component.scss']
})
export class AdavancedSearchComponent implements OnInit {

  displayedColumns: string[] = ['profil', 'identite', 'specialite', 'structure', 'localisation', 'distance', 'actions'];
  dataSource: MatTableDataSource<any>;
  data: any[] = [];
  sortBy = '';
  isLoading = true;
  chips: Chip[] = [];
  showHospitals: boolean = true;
  showReceivers: boolean = true;
  showPractitioners: boolean = true;
  showDetail: boolean = false;
  dataPerson = {
    firstName: "",
    lastName: "",
    speciality: "",
    rpps: "",
    phone: "",
    location: "",
    email: ""
  };
  combinedDatas: any;
  persons: any[] = [];
  specialities: any[] = [];
  hospitals: any[] = [];
  filteredData: any[] = [];

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  constructor(private advancedSearchService: AdvancedSearchService) {
    this.dataSource = new MatTableDataSource(this.combinedDatas);
  }

  ngOnInit(): void {
    this.getSearchData();
  }

  getSearchData() {
    combineLatest([
      this.advancedSearchService.getPersons(),
      this.advancedSearchService.getSpecialities(),
      this.advancedSearchService.getStructures(),
      this.advancedSearchService.getLocations(),
    ]).pipe(
      tap({
        next: ([persons, specialities, structures, locations]) => {
          this.combinedDatas = [persons, specialities, structures, locations];
          this.persons = [...persons.map(person => ({
            profil: 'person',
            identite: `${person.lastName} ${person.firstName} `,
            firstName: person.firstName,
            lastName: person.lastName,
            specialite: person.medicalSpecialtyNames,
            structure: person.medicalStructureName,
            localisation: person.medicalStructurePostalCode + ', ' + person.medicalStructureCity,
            distance: `132 km`,
            actions: 'View'
          }))];
          this.specialities = [...specialities.map(speciality => ({
            profil: 'speciality',
            identite: speciality.name,
            specialite: "",
            specialiteId: speciality.medicalSpecialtyId,
            structure: "",
            localisation: "",
            distance: `128 km`,
            actions: 'View'
          })),]
          this.hospitals = [
            ...structures.map(structure => ({
              profil: 'hospital',
              identite: structure.name,
              specialite: structure.medicalSpecialties?.length + ' spécialité(s) disponible(s)',
              specialities: structure.medicalSpecialties,
              structure: structure.name,
              localisation: structure.postalCode + ', ' + structure.city,
              distance: `152 km`,
              actions: 'View'
            }))];

          this.data = [...this.hospitals, ...this.persons, ...this.specialities];
          this.filteredData = this.data;
          this.dataSource = new MatTableDataSource(this.data);
          this.dataSource.paginator = this.paginator;
        }
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
  }

  updateChips(chips: Chip[], searchTerm: string, location: string, item: Chip): Chip[] {
    let updatedChips = [...chips];

    if (searchTerm) {
      const searchTermExists = updatedChips.some(chip => chip.whoSearchText === searchTerm);
      if (!searchTermExists) {
        updatedChips.push({ ...item, name: searchTerm });
      }
    }

    if (location) {
      const locationExists = updatedChips.some(chip => chip.whereSearchText === location);
      if (!locationExists) {
        updatedChips.push({ ...item, name: location });
      }
    }

    return updatedChips;
  }


  removeChip(index: number) {
    this.chips.splice(index, 1);
    this.applyChipsFilter();
  }

  applyChipsFilter(item: any = {}): void {
    let datas = this.data;
    let filteredStructures = this.hospitals;
    let filteredPersons = this.persons;
    let filteredSpecialities = this.specialities;
    let specialitySectionUsed = false;
    let sdsSectionUsed = false;
    this.sortBy = ""
    this.chips.forEach(chip => {
      if (chip.sectionUsed === "SPECIALTIE") {
        specialitySectionUsed = true;
        this.showHospitals = true;
        this.showPractitioners = false;
        this.showReceivers = true;
        this.sortBy = "distance"
        filteredStructures = filteredStructures.filter(structure =>
          structure.specialities && structure.specialities.includes(chip.idSpeciality)
        );
        filteredPersons = filteredPersons.filter(person =>
          person.specialite && person.specialite.includes(chip.whoSearchText)
        );
        datas = [...filteredStructures, ...filteredPersons];
      }

      if (chip.whereAreaUsed) {
        this.showHospitals = false;
        this.showPractitioners = false;
        this.showReceivers = true;
        this.sortBy = "distance";
        filteredPersons = filteredPersons.filter(person =>
          person.localisation.toLowerCase().includes(chip.whereSearchText.toLowerCase())
        );
        datas = [...filteredPersons];
        if (specialitySectionUsed) {
          this.showHospitals = true;
          filteredStructures = filteredStructures.filter(structure =>
            structure.localisation.toLowerCase().includes(chip.whereSearchText.toLowerCase())
          );
          filteredPersons = filteredPersons.filter(person =>
            person.localisation.toLowerCase().includes(chip.whereSearchText.toLowerCase())
          );
          datas = [...filteredStructures, ...filteredPersons];
        }
      }

      if (chip.sectionUsed === "SDS") {
        sdsSectionUsed = true;
        this.showHospitals = false;
        this.showPractitioners = true;
        this.showReceivers = true;
        this.sortBy = "lastName";
        filteredSpecialities = filteredSpecialities.filter(specialty =>
          specialty.specialiteId && chip.selectedHospitalData.medicalSpecialties.includes(specialty.specialiteId)
        );
        filteredPersons = filteredPersons.filter(person =>
          person.structure && person.structure.includes(chip.whoSearchText)
        );
        datas = [...filteredSpecialities, ...filteredPersons];
      }

      if (specialitySectionUsed && item.sectionUsed == "") {
        filteredStructures = filteredStructures.filter(structure =>
          structure.identite.toLowerCase().includes(item.whoSearchText)
        );
        filteredPersons = filteredPersons.filter(person =>
          person.identite && (person.identite.toLowerCase().includes(item.whoSearchText))
        );
        datas = [...filteredStructures, ...filteredPersons];
      }

      if (sdsSectionUsed && item.sectionUsed == "") {
        this.showHospitals = false;
        this.showPractitioners = true;
        this.showReceivers = true;
        this.sortBy = "lastName"
        filteredSpecialities = filteredSpecialities.filter(specialty =>
          specialty.identite && specialty.identite.toLowerCase().includes(item.whoSearchText)
        );
        filteredPersons = filteredPersons.filter(person =>
          person.identite && (person.identite.toLowerCase().includes(item.whoSearchText)) ||
          person.specialite && (person.specialite.toLowerCase().includes(item.whoSearchText))
        );
        datas = [...filteredSpecialities, ...filteredPersons];
      }
    });

    if (this.chips.length === 0 && !this.isObjectEmpty(item)) {
      this.showHospitals = false;
      this.showPractitioners = false;
      this.showReceivers = true;
      this.sortBy = "distance";
      filteredPersons = filteredPersons.filter(person =>
        person.firstName.toLowerCase().startsWith(item.whoSearchText.toLowerCase()) ||
        person.lastName.toLowerCase().startsWith(item.whoSearchText.toLowerCase()) ||
        person.specialite && (person.specialite.toLowerCase().includes(item.whoSearchText)) ||
        person.structure && (person.structure.toLowerCase().includes(item.whoSearchText))
      );
      datas = [...filteredPersons];
    }

    this.filteredData = datas;
    this.dataSource.data = datas;
    this.applySort();
  }

  removeAllFilters(): void {
    this.chips = [];
    this.dataSource.data = this.data;
    this.filteredData = this.data;
    this.showHospitals = true;
    this.showPractitioners = true;
    this.showReceivers = true;
    this.showData();
    this.sortBy = '';
    this.applySort();
  }

  applySort() {
    const data = this.dataSource.data;
    this.dataSource.data = data.sort((a, b) => {
      switch (this.sortBy) {
        case 'firstName':
          if (a.profil === "person" && b.profil === "person") {
            return this.compareStrings(a.firstName, b.firstName);
          }
          return 0;
        case 'lastName':
          if (a.profil === "person" && b.profil === "person") {
            return this.compareStrings(a.lastName, b.lastName);
          }
          return 0;
        case 'specialty':
          return this.compareStrings(a.specialite, b.specialite);
        case 'distance':
          return this.compareNumbers(this.extractNumber(a.distance), this.extractNumber(b.distance));
        default:
          this.dataSource = new MatTableDataSource(this.data);
          this.dataSource.paginator = this.paginator;
          return 0;
      }
    });

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  compareStrings(a: string, b: string): number {
    return a.localeCompare(b);
  }

  compareNumbers(a: number, b: number): number {
    return a - b;
  }

  extractNumber(distance: string): number {
    return Number(distance.split(' ')[0]);
  }

  showData() {
    const filteredData = this.filteredData.filter(item => {
      if (this.showHospitals && item.profil === 'hospital') {
        return true;
      }
      if (this.showReceivers && item.profil === 'person') {
        return true;
      }
      if (this.showPractitioners && item.profil === 'speciality') {
        return true;
      }
      return false;
    });

    this.dataSource.data = filteredData.length ? filteredData : [];

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getItemsFromChild(items: any) {
    this.showDetail = items.showDetail ? items.showDetail : false;
    if (!this.showDetail) {
      if (items.sectionUsed != "")
        this.chips = this.updateChips(this.chips, items.whoSearchText, items.whereSearchText, items);

      if (items.whereSearchText && items.whereSearchText != "")
        this.chips = this.updateChips(this.chips, items.whoSearchText, items.whereSearchText, items);

    } else {
      this.chips = [];
      this.dataPerson = items.dataPerson ? items.dataPerson : {};
    }
    this.applyChipsFilter(items);
  }

  isObjectEmpty = (objectName: any = {}) => {
    return Object.keys(objectName).length === 0
  }
}
