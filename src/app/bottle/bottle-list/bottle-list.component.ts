import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {BottleService} from "../services/bottle.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {BottlesDataSource} from "../data/bottles-data-source";
import {fromEvent, merge} from "rxjs";
import {debounceTime, distinctUntilChanged, tap} from "rxjs/operators";
import Swal from "sweetalert2";
import {Bottle} from "../data/Bottle";
import {AngularCsv} from 'angular-csv-ext/dist/Angular-csv';

@Component({
    selector: 'app-bottle-list',
    templateUrl: './bottle-list.component.html',
    styleUrls: ['./bottle-list.component.css']
})
export class BottleListComponent implements OnInit, AfterViewInit {
    bottles!: BottlesDataSource;
    displayedColumns: string[] = ['name', 'code', 'price', 'internal_stock', 'internal_stock_dirty', 'actions'];
    totalBottles: number = 0;

    exportCsvOptions = {
        fieldSeparator: ';',
        useHeader: true,
        headers: ['name', 'description', 'code', 'price', 'nbr_by_palette', 'internal_stock', 'internal_stock_dirty']
    }

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('input') input!: ElementRef;

    constructor(
        private bottleService: BottleService,
        private toastr: ToastrService,
        public router: Router
    ) {
    }

    ngOnInit(): void {
        this.bottles = new BottlesDataSource(this.bottleService);
        this.bottles.loadBottles();
    }

    ngAfterViewInit(): void {
        this.countAllBottles();

        // server-side search
        fromEvent(this.input.nativeElement, 'keyup').pipe(
            debounceTime(500),
            distinctUntilChanged(),
            tap(() => {
                this.paginator.pageIndex = 0;
                this.loadBottlesPage();
                this.countAllBottles();
            })
        ).subscribe();

        // reset the paginator after sorting
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

        merge(this.sort.sortChange, this.paginator.page).pipe(
            tap(() => {
                this.loadBottlesPage();
            })
        ).subscribe();
    }

    loadBottlesPage(): void {
        this.bottles.loadBottles(
            this.input.nativeElement.value,
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize);
    }

    makeNbrPalette(bottle: Bottle, dirty: boolean = false): number {
        const nbrBottle = dirty ? bottle.internal_stock_dirty : bottle.internal_stock;
        let nbrPalette = Math.floor(nbrBottle / bottle.nbr_by_palette);
        nbrPalette = isNaN(nbrPalette) ? 0 : nbrPalette;
        return nbrPalette
    }

    countAllBottles(): void {
        this.bottleService.countAllBottles(
            this.input.nativeElement.value
        ).subscribe(
            (totalBottles: number) => {
                this.totalBottles = totalBottles;
            }
        );
    }

    editBottle(idBottle: string): void {
        this.router.navigate(['bottle', 'edit', idBottle]).then();
    }

    addBottles(bottle: Bottle): void {
        Swal.fire({
            title: `Ajouter des bouteilles propres`,
            icon: 'question',
            input: 'number',
            inputLabel: 'Combient de bouteilles propres voulez vous ajouter ?',
            showCancelButton: true
        }).then(response => {
            if (response.isConfirmed && response.value && response.value != 0) {
                bottle.internal_stock = Number(bottle.internal_stock) + parseInt(response.value)
                this.bottleService.editBottle(bottle.id, bottle).subscribe({
                    next: () => {this.toastr.success('Le nombre de bouteilles propres a été modifié', 'Modifier')},
                    error: (err) => {
                        this.errorSubmit(err)
                    }
                })
            }
        })
    }

    addDirtyBottles(bottle: Bottle): void {
        Swal.fire({
            title: `Ajouter des bouteilles sales`,
            icon: 'question',
            input: 'number',
            inputLabel: 'Combient de bouteilles sales voulez vous ajouter ?',
            showCancelButton: true
        }).then(response => {
            if (response.isConfirmed && response.value && response.value != 0) {
                bottle.internal_stock_dirty = Number(bottle.internal_stock_dirty) + parseInt(response.value)
                this.bottleService.editBottle(bottle.id, bottle).subscribe({
                    next: () => {this.toastr.success('Le nombre de bouteilles sales a été modifié', 'Modifier')},
                    error: (err) => {
                        this.errorSubmit(err)
                    }
                })
            }
        })
    }

    exportAllBottles() {
        this.bottleService.getBottlesExport().subscribe(
            (bottles: Bottle[]) => {
                new AngularCsv(bottles, 'export', this.exportCsvOptions)
            }
        );
    }

    deleteBottle(idBottle: string): void {
        Swal.fire({
            title: `Supprimer le type de bouteille`,
            icon: 'warning',
            text: 'Êtes-vous sûr de vouloir supprimer ce type de bouteille ?',
            showConfirmButton: true,
            confirmButtonText: 'Supprimer',
            showCancelButton: true,
            cancelButtonText: 'Annuler'
        }).then(
            (result) => {
                if (result.isConfirmed) {
                    this.bottleService.deleteBottle(idBottle).subscribe({
                        next: () => {
                            this.loadBottlesPage();
                            this.countAllBottles();
                            this.toastr.success('Le type de bouteille a été supprimé', 'Supprimer');
                        },
                        error: (err) => {
                            this.errorSubmit(err)
                        }
                    })
                }
            }
        )
    }

    errorSubmit(error: string[] | string) {
        console.error(error);
        if (Array.isArray(error)) {
            error.map((err: string) => {
                this.toastr.error(err, 'Error !');
            })
        } else {
            this.toastr.error(error, 'Error !');
        }
    }
}
