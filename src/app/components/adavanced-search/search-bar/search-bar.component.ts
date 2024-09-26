import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs';
import { Person, Specialty, Structure } from 'src/app/common';
import { calculateDistance } from 'src/app/common/Utilities';
import { Departement } from 'src/app/common/models/departement.model';
import { Location } from 'src/app/common/models/location.model';



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

  searchTerm: string = '';
  location: string = '';
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
      map(value => value.length >= 1 ? this._filterLocation(value || '', this.locations, 0) : []),
    );

    this.filteredDepartements = this.searchLocationControl.valueChanges.pipe(
      startWith(''),
      map(value => value.length >= 1 ? this._filterLocation(value || '', this.departements, 1) : []),
    );
  }

  ngOnInit(): void {
    this.persons = this.data[0];
    this.specialities = this.data[1];
    this.structures = this.data[2];
    this.locations = this.data[3];
    this.departements = this.data[4];
  }

  private _filter(value: string, data: any, type: number): any[] {
    this.toHighlight = value;
    const filterValue = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var result = data.filter((option: any) => {
      var name = '';
      if (type == 0) {
        name = option.firstName.concat(' ' + option.lastName);
      } else {
        name = option.name;
      }
      const words = name.split(/[\s-]+/).map((part: any) => part.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
      return words.some((word: any) => word.startsWith(filterValue))
    });

    const user = this.persons[0];

    return result.sort((a: any, b: any) => {
      const hasCoordinates = user.medicalStructureLatitude !== null && user.medicalStructureLongitude !== null;
      if (type == 0) {
        if (hasCoordinates) {
          const distanceA = calculateDistance(a.medicalStructureLatitude, a.medicalStructureLongitude, user);
          const distanceB = calculateDistance(b.medicalStructureLatitude, b.medicalStructureLongitude, user);
          return distanceA - distanceB;
        }
        else {
          const lastNameComparison = a.lastName.localeCompare(b.lastName);
          if (lastNameComparison === 0) {
            return a.firstName.localeCompare(b.firstName);
          }
          return lastNameComparison;
        }
      } else {
        if (type == 2) {
          const hasCoordinatesA = a.latitude !== null && a.longitude !== null;
          const hasCoordinatesB = b.latitude !== null && b.longitude !== null;
          if (hasCoordinates && hasCoordinatesA && hasCoordinatesB) {
            const distanceA = calculateDistance(a.latitude, a.longitude, user);
            const distanceB = calculateDistance(b.latitude, b.longitude, user);
            return distanceA - distanceB;
          }
        }
        return a.name.localeCompare(b.name)
      }

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

    if (selectedValue && selectedValue.hasOwnProperty('passwordExpirationDelay')) {
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
    this.onSearch();
  }



  getData(dataOption: any, locationOption: any) {
    var item: any = {}
    if (dataOption) {
      item.whoAreaUsed = true;
      item.sectionUsed = "",
        item.showDetail = false;
      item.dataPerson = {};
      item.idSpeciality = -1;
      item.selectedHospitalData = {};

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
            location: dataOption.medicalStructurePostalCode + ', ' + dataOption.medicalStructureCity,
            email: dataOption.email,
            website: dataOption.website,
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
    }

    if (locationOption) {
      item.whereSearchText = locationOption;
      item.whereAreaUsed = true;
    }

    if (dataOption || locationOption) {
      console.log(item)
      this.newItemEvent.emit(item);
    }
    this.newItemEvent.emit(item);
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
    this.isQuiSelected = false;  // Reset selection when typing
    this.isSpecialtySelected = false;  // Specialty not selected when typing starts

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
      this.searchTerm = ''; // Clear the "Qui" field if no selection was made
    }
    this.searchControl.disable();
    if (this.location === '' || this.isSpecialtySelected) {
      this.searchControl.enable();
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
    // this.searchLocationControl.reset();
  }

  onLocationFocus() {
    // this.searchControl.reset();
  }

}
