import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs';
import { Person, Specialty, Structure } from 'src/app/common';
import { Location } from 'src/app/common/models/location.model';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SearchBarComponent implements OnInit {

  @Input() data: any;
  @Output() newItemEvent = new EventEmitter<any>();
  @ViewChild(MatAutocompleteTrigger) matAutocomplete: any;

  searchControl = new FormControl('');
  searchLocationControl = new FormControl('');
  searchTerm: string = '';
  location: string = '';
  persons: Person[] = [];
  specialities: Specialty[] = [];
  structures: Structure[] = [];
  locations: Location[] = [];
  filteredPersons: any;
  filteredSpecialities: any;
  filteredStructures: any;
  filteredLocation: any;
  toHighlight: string = '';

  // Variables to track if user is typing or has selected a value
  isTypingQui: boolean = false;
  isTypingOu: boolean = false;
  isQuiSelected: boolean = false;
  isOuSelected: boolean = false;
  isSpecialtySelected: boolean = false;
  isLocationSelected: boolean = false;

  constructor() {
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
      map(value => value.length >= 1 ? this._filterLocation(value || '', this.locations) : []),
    );
  }

  ngOnInit(): void {
    this.persons = this.data[0];
    this.specialities = this.data[1];
    this.structures = this.data[2];
    this.locations = this.data[3];
  }

  private _filter(value: string, data: any, type: number): any[] {
    this.toHighlight = value;
    const filterValue = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return data.filter((option: any) => {
      var name = '';
      if (type == 0) {
        name = option.firstName.concat(' ' + option.lastName);
      } else {
        name = option.name;
      }
      const words = name.split(/[\s-]+/).map((part: any) => part.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
      return words.some((word: any) => word.startsWith(filterValue))
    });
  }

  onSearch() {
    if (this.isLocationSelected) {
      this.getData(this.searchTerm, this.location);
    } else {
      this.getData(this.searchTerm, null);
    }
  }

  onOptionSelected(event: any): void {
    const selectedValue = event.option.value;

    if (selectedValue && selectedValue.hasOwnProperty('medicalSpecialtyId')) {
      this.isSpecialtySelected = true;
      this.isQuiSelected = true;  // Something is selected
      this.searchLocationControl.enable(); // Enable "Où" field if a specialty is selected
    } else {
      this.isSpecialtySelected = false;
      this.isQuiSelected = true;
      this.searchLocationControl.disable();
    }
    this.getData(selectedValue, this.location);
  }

  onEnter() {
    if (this.matAutocomplete.panelOpen) {
      this.matAutocomplete.closePanel();
    }
    this.isSpecialtySelected = false;
    this.isQuiSelected = false;
    this.searchLocationControl.disable();
    this.onSearch();
  }

  getData(dataOption: any, locationOption: any) {
    var item: any = {
      whoAreaUsed: true,
      whereAreaUsed: false,
      whoSearchText: "",
      whereSearchText: "",
      sectionUsed: "",
      showDetail: false,
      dataPerson: {},
      idSpeciality: -1,
      selectedHospitalData: {}
    }
    if (locationOption) {
      item.whereSearchText = locationOption;
      item.whereAreaUsed = true;
    }
    if (typeof (dataOption) === 'string') {
      item.whoSearchText = dataOption;
    } else {
      if (this.persons.includes(dataOption)) {
        item.whoSearchText = dataOption.fullName;
        item.sectionUsed = "PS";
        item.showDetail = true;
        item.dataPerson = {
          firstName: dataOption.firstName,
          lastName: dataOption.lastName,
          speciality: dataOption.medicalSpecialtyNames,
          rpps: dataOption.rpps,
          phone: dataOption.phoneNumber,
          location: ' ... ',
          email: dataOption.email,
          medicalStructureName: dataOption.medicalStructureName,
          address: dataOption.medicalStructurePostalCode + ' ' + dataOption.medicalStructureStreet + ' ' + dataOption.medicalStructureCity
        }
      } else if (this.specialities.includes(dataOption)) {
        item.whoSearchText = dataOption.name;
        item.sectionUsed = "SPECIALTIE";
        item.idSpeciality = dataOption.medicalSpecialtyId;
      } else {
        item.whoSearchText = dataOption.name;
        item.sectionUsed = "SDS",
          item.selectedHospitalData = { medicalSpecialties: dataOption.medicalSpecialties };
      }
    }

    this.newItemEvent.emit(item);
  }

  displayFn(option: any): string {
    return option ? option.name ? option.name : option.fullName : '';
  }

  private _filterLocation(value: string, data: any): any[] {
    this.toHighlight = value;
    // Check if the input starts with a number
    if (!isNaN(Number(value))) {
      // Case 1: 1 digit, return nothing
      if (value.length === 1) {
        return [];
      }

      // Case 2: 2 digits, return postal code + city name with these 2 digits
      if (value.length === 2) {
        return data.filter((option: Location) => {
          const postalCode = option.postalCode.toString();
          return postalCode.startsWith(value);  // Return matching postal codes with 2 digits
        });
      }

      // Case 3: 3 digits, return postal code + city name with these 3 digits
      if (value.length >= 3) {
        return data.filter((option: Location) => {
          const postalCode = option.postalCode.toString();
          return postalCode.startsWith(value);  // Return matching postal codes with 3 digits
        });
      }

    } else {
      // Case 4: 1 or 2 letters, return nothing
      if (value.length <= 2) {
        return [];
      }

      // Case 5: 3 or more letters, return city names where any word starts with these 3 letters
      return data.filter((option: Location) => {
        const city = option.city ? option.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
        return city.split(' ').some(word => word.startsWith(value.toLowerCase()));
      });
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

    // Set the value of 'location' to the selected option
    this.location = `${selectedValue.postalCode}, ${selectedValue.city}`;
    this.getData(this.searchTerm, this.location)
  }

  // Handle typing in Qui (Who) input
  onQuiInputChange(): void {
    this.isQuiSelected = false;  // Reset selection when typing
    this.isSpecialtySelected = false;  // Specialty not selected when typing starts

    // Disable "Où" field while typing in "Qui"
    this.searchLocationControl.disable();
    this.location = ''; // Clear the "Où" field
  }

  // Handle typing in Ou (Where) input
  onOuInputChange(): void {
    // If the user starts typing in "Où" without selecting a specialty in "Qui"
    if (!this.isQuiSelected && !this.isSpecialtySelected) {
      this.searchTerm = ''; // Clear the "Qui" field if no selection was made
    }
  }


  clearQuiField(): void {
    this.searchTerm = '';  // Clear "Qui" if no valid selection
    this.searchLocationControl.enable();
  }

  clearOuField(): void {
    this.location = '';            // Clear the input value
    this.isOuSelected = false;     // Reset the selected state
    this.isTypingOu = false;       // Reset the typing state
    this.searchControl.enable();   // Re-enable the "Qui" input
    this.isLocationSelected = false;
  }

  onSearchFocus() {
    this.searchLocationControl.reset();
  }

  onLocationFocus() {
    this.searchControl.reset();
  }
}