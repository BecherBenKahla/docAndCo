import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { Person, Specialty, Structure } from 'src/app/common';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SearchBarComponent implements OnInit {

  searchControl = new FormControl('');
  searchTerm: string = '';
  location: string = '';
  persons : Person[] = [];
  specialities : Specialty[] = [];
  structures : Structure[] = [];
  filteredPersons: any;
  filteredSpecialities: any;
  filteredStructures: any;
  toHighlight: string = '';
  //currentFilteredOptions:any;
  
  @Input() data : any;
  @Output() newItemEvent = new EventEmitter<any>();

  
  constructor() { 

    this.filteredPersons = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => value.length >= 1 ? this._filter(value || '', this.persons, 0): []),
    );

    this.filteredSpecialities = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => value.length >= 1 ? this._filter(value || '', this.specialities, 1): []),
    );

    this.filteredStructures = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => value.length >= 1 ? this._filter(value || '', this.structures, 2): []),
    );

    /*this.filteredPersons.subscribe((options:any) => {
      this.currentFilteredOptions = options;
    });*/

    
   }

  ngOnInit(): void {
    this.persons = this.data[0];
    this.specialities = this.data[1];
    this.structures = this.data[2];
  }

  private _filter(value: string, data : any, type : number): any[] {
    this.toHighlight = value;
    const filterValue = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return data.filter((option :any) => {
      var name = '';
      if(type == 0) {
        name = option.firstName.concat(' '+option.lastName);
      } else {
        name = option.name;
      }
      const words = name.split(/[\s-]+/).map((part:any) => part.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
      return words.some((word:any) => word.startsWith(filterValue))
    });
  }
  
  onSearch() {
    //this.newItemEvent.emit(this.currentFilteredOptions);
    if(typeof(this.searchTerm) === 'string') {
      this.newItemEvent.emit(this.searchTerm);
    } else {
      this.getData(this.searchTerm);
    }
    
  }

  onOptionSelected(event : any): void { 
    this.getData(event.option.value);
  }

  getData(dataOption:any) {
    var item : any = {
      whoAreaUsed: true ,
      whereAreaUsed: false,
      whoSearchText: "",
      whereSearchText: "",
      sectionUsed: "",
      showDetail:false,
      dataPerson:{}
    }
    if(this.persons.includes(dataOption)) {
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
        email: dataOption.email
      }
    } else if(this.specialities.includes(dataOption)) {
        item.whoSearchText = dataOption.name;
        item.sectionUsed = "SPECIALTIE";
    } else {
      item.whoSearchText = dataOption.name;
      item.sectionUsed = "SDS";
    }
    //this.newItemEvent.emit(event.option.value);
    this.newItemEvent.emit(item);
  }

  displayFn(option: any): string {
    return option ? option.name ? option.name : option.fullName : '';
  }
}
