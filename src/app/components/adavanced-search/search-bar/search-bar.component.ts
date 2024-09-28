import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs';
import { Person, Specialty, Structure } from 'src/app/common';
import { Departement } from 'src/app/common/models/departement.model';
import { Location } from 'src/app/common/models/location.model';
import { DataService } from 'src/app/services/data/data.service';



@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SearchBarComponent implements OnInit {

  @Input() data: any;
  @Output() newItemEvent = new EventEmitter<any>();
  @ViewChild(MatAutocompleteTrigger) matAutocomplete: any;

  searchControl = new FormControl('');
  searchLocationControl = new FormControl('');

  searchTerm = '';
  location = '';
  persons: Person[] = [];
  specialities: Specialty[] = [];
  structures: Structure[] = [];

  locations: Location[] = [];
  departements: Departement[] = [];
  filteredPersons: any;
  filteredSpecialities: any;
  filteredStructures: any;
  filteredLocation: any;
  filteredDepartements: any;
  toHighlight = '';

  // Variables to track if user is typing or has selected a value
  isTypingQui = false;
  isTypingOu = false;
  isQuiSelected = false;
  isOuSelected = false;
  isSpecialtySelected = false;
  isLocationSelected = false;

  constructor(private dataService: DataService) {
    this.filteredPersons = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => value.length >= 1 ? this._filter(value || '', this.persons, 0) : []),
    );

    this.filteredSpecialities = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => value.length >= 1 ? this._filter(value || '', this.specialities, 1) : []),
    );

    this.filteredStructures = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => value.length >= 1 ? this._filter(value || '', this.structures, 2) : []),
    );


    this.filteredLocation = this.searchLocationControl.valueChanges.pipe(
      startWith(''),
      map(value => value.length >= 1 ? this._filterLocation(value || '', this.locations, 0) : []),
    );

    this.filteredDepartements = this.searchLocationControl.valueChanges.pipe(
      startWith(''),
      map(value => value.length >= 1 ? this._filterLocation(value || '', this.departements, 1) : []),
    );
  }

  ngOnInit(): void {
    [this.persons, this.specialities, this.structures, this.locations, this.departements] = this.data;
  }

  private _filter(value: string, data: any, type: number): any[] {
    this.toHighlight = value;
    const filterValue = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var result = data.filter((option: any) => {
      var name = type == 0 ? option.firstName.concat(' ' + option.lastName) : option.name;
      const words = name.split(/[\s-]+/).map((part: any) => part.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
      const filterParts = filterValue.toLowerCase().split(/[\s-]+/).map((part: any) =>
        part.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      );

      // Check if all filter parts are matched
      return filterParts.every((filterPart: string) => {
        const matchesWithoutPrefix = words.some((word: any) => word.startsWith(filterPart));
        const matchesWithPrefix = words.some((word: any) => {
          // Matches any letter followed by an apostrophe
          const regex = /^[a-zA-Z]['’]/;
          const regexPa = /\([a-zA-Z]+/;
          // Remove the prefix if it exists
          const wordWithoutPrefix = regex.test(word) ? word.substring(2) : regexPa.test(word) ? word.substring(1) : word;
          return wordWithoutPrefix.startsWith(filterPart);
        });
        // Return true if either match found
        return matchesWithoutPrefix || matchesWithPrefix;
      });

    });
    return this.dataService.sortData(result, this.persons[0], type);
  }

  onSearch() {
    let location = this.isLocationSelected ? this.location : null;
    this.getData(this.searchTerm, location);
  }

  onOptionSelected(event: any): void {
    const selectedValue = event.option.value;
    const hasPasswordExpirationDelay = selectedValue?.hasOwnProperty('passwordExpirationDelay') ?? false;

    this.isSpecialtySelected = hasPasswordExpirationDelay;
    this.isQuiSelected = true;
    hasPasswordExpirationDelay ? this.searchLocationControl.enable() : this.searchLocationControl.disable();
    this.getData(selectedValue, this.location);

  }

  onEnter() {
    if (this.matAutocomplete.panelOpen) {
      this.matAutocomplete.closePanel();
    }
    this.onSearch();
  }

  getData(dataOption: any, locationOption: any) {
    if (dataOption) {
      var itemSearch: any = {}
      itemSearch.whoAreaUsed = true;
      itemSearch.sectionUsed = "",
        itemSearch.showDetail = false;
      itemSearch.dataPerson = {};
      itemSearch.idSpeciality = -1;
      itemSearch.selectedHospitalData = {};

      if (typeof (dataOption) === 'string') {
        itemSearch.whoSearchText = dataOption;
      } else {
        if (this.persons.includes(dataOption)) {
          itemSearch.whoSearchText = dataOption.fullName;
          itemSearch.sectionUsed = "PS";
          itemSearch.showDetail = true;
          itemSearch.dataPerson = {
            firstName: dataOption.firstName,
            lastName: dataOption.lastName,
            speciality: dataOption.medicalSpecialtyNames,
            rpps: dataOption.rpps,
            phone: dataOption.phoneNumber,
            location: dataOption.medicalStructurePostalCode + ', ' + dataOption.medicalStructureCity,
            email: dataOption.email,
            website: dataOption.website,
            medicalStructureName: dataOption.medicalStructureName,
            address: dataOption.medicalStructurePostalCode + ' ' + dataOption.medicalStructureStreet + ' ' + dataOption.medicalStructureCity
          }
        } else if (this.specialities.includes(dataOption)) {
          itemSearch.whoSearchText = dataOption.name;
          itemSearch.sectionUsed = "SPECIALTIE";
          itemSearch.idSpeciality = dataOption.medicalSpecialtyId;
        } else {
          itemSearch.whoSearchText = dataOption.name;
          itemSearch.sectionUsed = "SDS",
            itemSearch.selectedHospitalData = { medicalSpecialties: dataOption.medicalSpecialties };
        }
      }
      this.newItemEvent.emit(itemSearch);
    }

    if (locationOption) {
      var itemLocation: any = {}
      itemLocation.whereSearchText = locationOption;
      itemLocation.whereAreaUsed = true;
      this.newItemEvent.emit(itemLocation);
    }
  }

  displayFn(option: any): string {
    return option ? option.name ? option.name : option.fullName : '';
  }

  private _filterLocation(value: string, data: any, type: number): any[] {
    this.toHighlight = value;

    // Normalize and clean up the input value (removing accents, apostrophes, hyphens, etc.)
    const normalizedValue = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Prepare the search terms by splitting the input into parts for matching (e.g., "Saint Mau")
    const searchParts = normalizedValue.split(/\s+/).filter(part => part.length > 0); // Split by spaces, ignore empty parts

    // Case for numbers (postal code or department code search)
    if (!isNaN(Number(normalizedValue))) {
      if (normalizedValue.length === 1) return [];

      if (normalizedValue.length === 2 && type === 1) {
        return data.filter((option: Departement) => {
          return option.num_dep.startsWith(normalizedValue); // Match department codes
        });
      }

      if (normalizedValue.length >= 3 && type === 0) {
        return data.filter((option: Location) => {
          return option.postalCode.startsWith(normalizedValue); // Match postal codes
        });
      }
    } else {
      // Handling for strings (city or department names)

      if (normalizedValue.length <= 2) return []; // Skip if search value is too short

      if (type === 0) {
        // For location/city names
        return data.filter((option: Location) => {
          const city = option.city ? option.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
          const cityWords = city.split(/[\s\-']/); // Split on spaces, hyphens, and apostrophes
          return searchParts.every(part => cityWords.some(word => word.startsWith(part))); // Check each search part
        });
      }

      if (type === 1) {
        // For department names
        return data.filter((option: Departement) => {
          const depName = option.dep_name ? option.dep_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
          const depWords = depName.split(/[\s\-']/); // Split on spaces, hyphens, and apostrophes
          return searchParts.every(part => depWords.some(word => word.startsWith(part))); // Check each search part
        });
      }
    }

    // Default return empty array if no conditions match
    return [];
  }

  locationSelected(event: any): void {
    this.isLocationSelected = true;
    this.isOuSelected = true;
    this.isTypingOu = false;
    // The selected option's value
    const selectedValue = event.option.value;

    // Check if the selected value is a city or a department
    if (selectedValue.postalCode && selectedValue.city) {
      // It's a city selection
      this.location = `${selectedValue.postalCode}, ${selectedValue.city}`;
    } else if (selectedValue.num_dep && selectedValue.dep_name) {
      // It's a department selection
      this.location = `${selectedValue.num_dep}, ${selectedValue.dep_name}, ${selectedValue.region_name}`;
    }
    this.getData(this.searchTerm, this.location)
  }

  // Handle typing in Qui (Who) input
  onQuiInputChange(): void {
    // Reset selection when typing
    this.isQuiSelected = false;
    // Specialty not selected when typing starts
    this.isSpecialtySelected = false;

    // Disable "Où" field while typing in "Qui"
    this.searchLocationControl.disable();
    this.location = ''; // Clear the "Où" field

    if (this.searchTerm === '') {
      this.searchLocationControl.enable();
    }
  }

  // Handle typing in Ou (Where) input
  onOuInputChange(): void {
    // If the user starts typing in "Où" without selecting a specialty in "Qui"
    if (!this.isQuiSelected && !this.isSpecialtySelected) {
      // Clear the "Qui" field if no selection was made
      this.searchTerm = '';
    }
    this.searchControl.disable();
    if (this.location === '' || this.isSpecialtySelected) {
      this.searchControl.enable();
    }
  }

  clearQuiField(): void {
    // Clear "Qui" if no valid selection
    this.searchTerm = '';
    this.searchLocationControl.enable();
  }

  clearOuField(): void {
    this.location = '';
    this.isOuSelected = false;
    this.isTypingOu = false;
    this.searchControl.enable();
    this.isLocationSelected = false;
  }
}
