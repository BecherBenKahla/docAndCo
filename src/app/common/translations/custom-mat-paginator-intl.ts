import { MatPaginatorIntl } from "@angular/material/paginator";

export function CustomPaginator(): MatPaginatorIntl {
    const customPaginatorIntl = new MatPaginatorIntl();

    customPaginatorIntl.itemsPerPageLabel = 'Enregistrement  par page :';
    customPaginatorIntl.nextPageLabel = 'Page suivante';
    customPaginatorIntl.firstPageLabel = 'Première page';
    customPaginatorIntl.lastPageLabel = 'Dernière page';
    customPaginatorIntl.previousPageLabel = 'Page précédente';
    customPaginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
            return `0 à ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;

        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} sur ${length}`;
    };

    return customPaginatorIntl;
}