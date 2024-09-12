export interface Structure {
    city?: string,
    createdDate?: Date,
    finessNumber?: number,
    isRegistered?: boolean,
    latitude?: number,
    longitude?: number,
    medicalSpecialties?: number[],
    medicalSpecialtiesScores?: string[],
    medicalStructureId?: number,
    name?: string,
    nameWithAddress?: string,
    nbAccounts?: number,
    postalCode?: number,
    street?: string,
    type?: number
}