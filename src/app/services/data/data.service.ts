import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  isObjectEmpty = (objectName: any = {}) => {
    return Object.keys(objectName).length === 0
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
}