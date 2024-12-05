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

  getLengthBeforeComma(text: string): number {
    const index = text.indexOf(',');
    return index !== -1 ? index : text.length;
  }

  calculateDistance(destLat: number, destLng: number, currentClaim: any): number {
    const srcLat = currentClaim.medicalStructureLatitude;
    const srcLng = currentClaim.medicalStructureLongitude;
    return this.calculateDistanceValue(destLat, destLng, srcLat, srcLng);
  }

  calculateDistanceValue(destLat: number, destLng: number, srcLat: number, srcLng: number): number {
    if (srcLat === 0 || destLat === 0) return 0;
    const p = 0.017453292519943295;    // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((destLat - srcLat) * p) / 2 + c(srcLat * p) * c(destLat * p) * (1 - c((destLng - srcLng) * p)) / 2;
    const result = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    return Math.round(result * 100) / 100;
  }

  sortData(result: any, user: any, type: any) {
    return result.sort((a: any, b: any) => {
      const hasCoordinates = user.medicalStructureLatitude !== null && user.medicalStructureLongitude !== null;
      if (type == 0) {
        if (hasCoordinates) {
          const distanceA = this.calculateDistance(a.medicalStructureLatitude, a.medicalStructureLongitude, user);
          const distanceB = this.calculateDistance(b.medicalStructureLatitude, b.medicalStructureLongitude, user);
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
            const distanceA = this.calculateDistance(a.latitude, a.longitude, user);
            const distanceB = this.calculateDistance(b.latitude, b.longitude, user);
            return distanceA - distanceB;
          }
        }
        return a.name.localeCompare(b.name)
      }

    });
  }
}





