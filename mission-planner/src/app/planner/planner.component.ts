import { Component } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable
} from '@angular/material/table';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { PointService } from '../services/point.service';
import { Point } from '../models/point.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-planner',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTable,
        MatCard,
        MatCardContent,
        MatHeaderCell,
        MatCell,
        MatColumnDef,
        MatHeaderCellDef,
        MatCellDef,
        MatHeaderRow,
        MatRow,
        MatButton,
        MatRowDef,
        MatHeaderRowDef
    ],
    templateUrl: './planner.component.html',
    styleUrl: './planner.component.scss'
})
export class PlannerComponent {
    public pointForm: FormGroup;
    public points$: Observable<Point[]>;

    constructor(
        private fb: FormBuilder,
        private pointService: PointService
    ) {
        this.pointForm = this.fb.group({
            name: ['', Validators.required],
            x: ['', [Validators.required, Validators.min(0), Validators.max(1000)]],
            y: ['', [Validators.required, Validators.min(0), Validators.max(500)]]
        });

        this.points$ = this.pointService.points$;
    }

    addPoint(): void {
        if (this.pointForm.valid) {
            const newPoint: Point = this.pointForm.value;
            this.pointService.addPoint(newPoint);
            this.pointForm.reset();
        }
    }
}
