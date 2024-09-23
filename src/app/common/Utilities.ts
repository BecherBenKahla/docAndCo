export function calculateDistance(destLat: number, destLng: number, currentClaim: any): number {
  const srcLat = currentClaim.medicalStructureLatitude;
  const srcLng = currentClaim.medicalStructureLongitude;
  return calculateDistanceValue(destLat, destLng, srcLat, srcLng);
}

export function calculateDistanceValue(destLat: number, destLng: number, srcLat: number, srcLng: number): number {

  if (srcLat === 0 || destLat === 0) return 0;
  const p = 0.017453292519943295;    // Math.PI / 180
  const c = Math.cos;
  const a = 0.5 - c((destLat - srcLat) * p)/2 + c(srcLat * p) * c(destLat * p) * (1 - c((destLng - srcLng) * p))/2;
  const result = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  return Math.round(result*100)/100;

}