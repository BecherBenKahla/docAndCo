import { Structure } from 'src/app/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { combineLatest, finalize, first, tap } from 'rxjs';
import { AdvancedSearchService } from 'src/app/services/advanced-search/advanced-search.service';

@Component({
  selector: 'app-adavanced-search',
  templateUrl: './adavanced-search.component.html',
  styleUrls: ['./adavanced-search.component.scss']
})
export class AdavancedSearchComponent implements OnInit {

  displayedColumns: string[] = ['profil', 'identite', 'specialite', 'structure', 'localisation', 'distance', 'actions'];
  dataSource: MatTableDataSource<any>;
  data: any[] = [];
  sortBy = 'lastName';
  isLoading = true;
  chips: string[] = [];
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
  whoAreaUsed: boolean = true;
  whereAreaUsed: boolean = false;
  sectionUsed: string = "";
  combinedDatas: any;

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
    ]).pipe(
      tap({
        next: ([persons, specialities, structures]) => {
          this.combinedDatas = [persons, specialities, structures];

          const combinedData = [
            ...structures.map(structure => ({
              profil: 'hospital',
              identite: structure.name,
              specialite: structure.medicalSpecialties?.length + ' spécialité(s) disponible(s)',
              specialities: structure.medicalSpecialties,
              structure: structure.name,
              localisation: structure.street,
              distance: `152 km`,
              actions: 'View'
            })),
            ...persons.map(person => ({
              profil: 'person',
              identite: `${person.lastName} ${person.firstName} `,
              firstName: person.firstName,
              lastName: person.lastName,
              specialite: person.medicalSpecialtyNames,
              structure: person.medicalStructureName,
              localisation: person.medicalStructurePostalCode + '' + person.medicalStructureStreet,
              distance: `132 km`,
              actions: 'View'
            })),
            ...specialities.map(speciality => ({
              profil: 'speciality',
              identite: speciality.name,
              specialite: speciality.name,
              specialiteId: speciality.medicalSpecialtyId,
              structure: "speciality.structure",
              localisation: " speciality.location",
              distance: `128 km`,
              actions: 'View'
            })),

          ];
          this.data = combinedData;
          this.dataSource = new MatTableDataSource(combinedData);
          this.dataSource.paginator = this.paginator;
        }
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
  }

  updateChips(chips: string[], searchTerm: string, location: string): string[] {
    let updatedChips = [...chips];

    if (searchTerm && !updatedChips.includes(searchTerm)) {
      updatedChips = [...updatedChips, searchTerm];
    }

    if (location && !updatedChips.includes(location)) {
      updatedChips = [...updatedChips, location];
    }

    return updatedChips;
  }

  removeChip(chip: string) {
    console.log('Chip supprimé');
    const index = this.chips.indexOf(chip);
    if (index >= 0) {
      this.chips.splice(index, 1);
    }
    this.applyChipsFilter();
  }

  applyChipsFilter(item: any = {}): void {
    if (this.chips.length === 0) {
      this.dataSource.filter = '';
      this.applySort();
      return;
    }

    const combinedFilter = this.chips.join(' ').toLowerCase();

    this.showHospitals = false;
    this.showPractitioners = false;
    this.showReceivers = true;
    this.sortBy = "distance";
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return data.identite.toLowerCase().includes(filter) ||
        data.specialite.toLowerCase().includes(filter) ||
        data.structure.toLowerCase().includes(filter);
    };

    if (item.sectionUsed == "SPECIALTIE") {
      this.showHospitals = true;
      this.showPractitioners = false;
      this.showReceivers = true;
      this.sortBy = "distance"
      this.dataSource.filterPredicate = (data: any, filter: string) => {

        if (data.profil === 'hospital') {
          if (item.whereAreaUsed) {
            return data.specialities && data.specialities.includes(item.specialtyId) || data.localisation && data.localisation.includes(item.whereSearchText);
          }
          return data.specialities && data.specialities.includes(item.specialtyId);
        }

        if (data.profil === 'person') {
          if (item.whereAreaUsed) {
            return data.specialite && data.specialite.includes(item.whoSearchText) || data.localisation && data.localisation.includes(item.whereSearchText);
          }
          return data.specialite && data.specialite.includes(item.whoSearchText);
        }

        return false;
      };
    }
    if (item.sectionUsed == "SDS") {
      this.showHospitals = false;
      this.showPractitioners = true;
      this.showReceivers = true;
      this.sortBy = "lastName"
      this.dataSource.filterPredicate = (data: any, filter: string) => {
        if (data.profil === 'person') {
          return data.structure && data.structure.includes(item.whoSearchText);
        }

        return false;
      };
    }

    this.dataSource.filter = combinedFilter.trim();
    this.dataSource.paginator = this.paginator;
    this.applySort();
    this.showData()

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  removeAllFilters(): void {
    console.log('Supprimer tous les filtres');
    this.chips = [];
    this.dataSource.filter = '';
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
    const filteredData = this.data.filter(item => {
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
    this.applySort();
    this.dataSource.paginator = this.paginator;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getItemsFromChild(items: any) {
    console.log(items)
    this.showDetail = items.showDetail ? items.showDetail : false;
    if (!this.showDetail) {
      this.chips = this.updateChips(this.chips, items.whoSearchText, items.whereSearchText);
    } else {
      this.chips = [];
      this.dataPerson = items.dataPerson ? items.dataPerson : {};
    }
    this.whoAreaUsed = items.whoAreaUsed;
    this.whereAreaUsed = items.whereAreaUsed;
    this.sectionUsed = items.sectionUsed;

    this.applyChipsFilter(items);
    console.log(this.chips)
  }

}