import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { combineLatest, finalize, tap } from 'rxjs';
import { Chip } from 'src/app/common';
import { AdvancedSearchService } from 'src/app/services/advanced-search/advanced-search.service';
import { calculateDistance, DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'app-adavanced-search',
  templateUrl: './adavanced-search.component.html',
  styleUrls: ['./adavanced-search.component.scss']
})
export class AdavancedSearchComponent implements OnInit {

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

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
    email: "",
    website: "",
    medicalStructureName: "",
    address: ""
  };
  combinedDatas: any;
  persons: any[] = [];
  specialities: any[] = [];
  hospitals: any[] = [];
  filteredData: any[] = [];

  constructor(
    private advancedSearchService: AdvancedSearchService,
    private dataService: DataService
  ) {
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
      this.advancedSearchService.getDepartements(),
    ]).pipe(
      tap({
        next: ([persons, specialities, structures, locations, departements]) => {
          this.combinedDatas = [persons, specialities, structures, locations, departements];
          const userLatLon = {
            medicalStructureLatitude: persons[0].medicalStructureLatitude,
            medicalStructureLongitude: persons[0].medicalStructureLongitude
          };
          this.processData(persons, specialities, structures, userLatLon);
        }
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
  }

  processData(persons: any[], specialities: any[], structures: any[], userLatLon: any) {
    this.persons = persons.map(person => this.mapPersonData(person, userLatLon));
    this.specialities = specialities.map(speciality => this.mapSpecialityData(speciality));
    this.hospitals = structures.map(structure => this.mapStructureData(structure, userLatLon));
    this.data = [...this.hospitals, ...this.persons, ...this.specialities];
    this.filteredData = this.data;
    this.updateDataSource();
  }

  mapPersonData(person: any, userLatLon: any) {
    return {
      profil: 'person',
      identite: `${person.lastName} ${person.firstName} `,
      firstName: person.firstName,
      lastName: person.lastName,
      specialite: person.medicalSpecialtyNames,
      structure: person.medicalStructureName,
      localisation: person.medicalStructurePostalCode + ', ' + person.medicalStructureCity,
      distance: calculateDistance(person.medicalStructureLatitude ? person.medicalStructureLatitude : 0, person.medicalStructureLongitude ? person.medicalStructureLongitude : 0, userLatLon) + '  km',
      isFavourite: person.isFavourite,
      isReceiver: person.isReceiver,
      nbAddressedClaims: person.nbAddressedClaims,
      nbDeniedClaims: person.nbDeniedClaims,
      actions: 'View'
    };
  }

  mapSpecialityData(speciality: any) {
    return {
      profil: 'speciality',
      identite: speciality.name,
      specialite: "",
      specialiteId: speciality.medicalSpecialtyId,
      structure: "",
      localisation: "",
      distance: "",
      actions: 'View'
    };
  }

  mapStructureData(structure: any, userLatLon: any) {
    return {
      profil: 'hospital',
      identite: structure.name,
      specialite: structure.medicalSpecialties?.length + ' spécialité(s) disponible(s)',
      specialities: structure.medicalSpecialties,
      structure: structure.name,
      localisation: structure.postalCode + ', ' + structure.city,
      distance: calculateDistance(structure.latitude ? structure.latitude : 0, structure.longitude ? structure.longitude : 0, userLatLon) + '  km',
      actions: 'View'
    };
  }

  updateDataSource() {
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
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
    this.sortBy = "";

    this.showHospitals = true;
    this.showPractitioners = true;
    this.showReceivers = true;

    this.chips.forEach(chip => {
      if (chip.sectionUsed === "SPECIALTIE") {
        specialitySectionUsed = true;
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
        this.sortBy = "distance";
        const departmentCode = chip.whereSearchText.split(',')[0].trim();
        const lengthBeforeComma = this.dataService.getLengthBeforeComma(departmentCode);
        if (lengthBeforeComma > 3) {
          filteredPersons = filteredPersons.filter(person =>
            person.localisation.toLowerCase().includes(chip.whereSearchText.toLowerCase())
          );
        } else {
          filteredPersons = filteredPersons.filter(person =>
            person.localisation.toLowerCase().startsWith(departmentCode)
          );
        }
        datas = [...filteredPersons];

        if (specialitySectionUsed) {
          this.showHospitals = true;
          if (lengthBeforeComma > 3) {
            filteredStructures = filteredStructures.filter(structure =>
              typeof structure.localisation === 'string' &&
              structure.localisation.toLowerCase().includes(chip.whereSearchText.toLowerCase())
            );
            filteredPersons = filteredPersons.filter(person =>
              typeof person.localisation === 'string' &&
              person.localisation.toLowerCase().includes(chip.whereSearchText.toLowerCase())
            );
          } else {
            filteredStructures = filteredStructures.filter((structure, index) =>
              typeof structure.localisation === 'string' &&
              structure.localisation.toLowerCase().startsWith(departmentCode.toLowerCase())
            );
            filteredPersons = filteredPersons.filter(person =>
              typeof person.localisation === 'string' &&
              person.localisation.toLowerCase().startsWith(departmentCode.toLowerCase())
            );
          }
          datas = [...filteredStructures, ...filteredPersons];
        }
      }

      if (chip.sectionUsed === "SDS") {
        sdsSectionUsed = true;
        this.showHospitals = false;
        this.sortBy = "lastName";
        filteredSpecialities = filteredSpecialities.filter(specialty =>
          specialty.specialiteId && chip.selectedHospitalData.medicalSpecialties.includes(specialty.specialiteId)
        );
        filteredPersons = filteredPersons.filter(person =>
          person.structure && person.structure.includes(chip.whoSearchText)
        );
        datas = [...filteredPersons, ...filteredSpecialities];
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

    if (this.chips.length === 0 && !this.dataService.isObjectEmpty(item)) {
      this.showHospitals = false;
      this.sortBy = "distance";
      const normalizeText = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const searchText = normalizeText(item.whoSearchText);
      const searchParts = searchText.split(' ').filter((part: string) => part.trim() !== '');

      filteredPersons = filteredPersons.filter(person => {
        const firstName = normalizeText(person.firstName);
        const lastName = normalizeText(person.lastName);
        const specialite = person.specialite ? normalizeText(person.specialite) : "";
        const structure = person.structure ? normalizeText(person.structure) : "";

        const matchesSingleTerm = [firstName, lastName, specialite, structure].some(field =>
          field.startsWith(searchText) || field.includes(searchText)
        );

        const matchesBothNames = searchParts.length === 2 &&
          firstName.startsWith(searchParts[0]) &&
          lastName.startsWith(searchParts[1]);

        return matchesSingleTerm || matchesBothNames;
      });

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
            return this.dataService.compareStrings(a.firstName, b.firstName);
          }
          return 0;
        case 'lastName':
          if (a.profil === "person" && b.profil === "person") {
            return this.dataService.compareStrings(a.lastName, b.lastName);
          }
          return 0;
        case 'specialty':
          if (a.profil !== "speciality" && b.profil !== "speciality") {
            return this.dataService.compareStrings(a.specialite, b.specialite);
          }
          return 0;
        case 'distance':
          if (a.profil !== "speciality" && b.profil !== "speciality") {
            return this.dataService.compareNumbers(this.dataService.extractNumber(a.distance), this.dataService.extractNumber(b.distance));
          }
          return 0;
        default:
          this.updateDataSource()
          return 0;
      }
    });

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  showData() {
    if (!this.showPractitioners) {
      this.showReceivers = false;
    }
    const filteredData = this.filteredData.filter(item => {
      if (this.showHospitals && item.profil === 'hospital') {
        return true;
      }
      if (this.showPractitioners && item.profil === 'person') {
        if (this.showReceivers) {
          return true;
        } else {
          if (!item.isReceiver) {
            return true;
          }
        }
      }

      if (item.profil === 'speciality') {
        return this.dataSource.data.some(existingItem => existingItem.id === item.id);
      }

      return false;
    });

    this.dataSource.data = filteredData.length ? filteredData : [];

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getItemsFromChild(items: any) {
    this.showDetail = !!items.showDetail;
    if (!this.showDetail) {
      if (items.sectionUsed != "") {
        this.chips = this.updateChips(this.chips, items.whoSearchText || "", items.whereSearchText || "", items);
      }
    } else {
      this.chips = [];
      this.dataPerson = items.dataPerson || {};
    }
    this.applyChipsFilter(items);
  }
}
