import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Point } from '../models/point.model';

@Injectable({
    providedIn: 'root'
})
export class PointService {
    public pointsSource = new BehaviorSubject<Point[]>([
        {
            name: 'start',
            x: 100,
            y: 100
        },
        {
            name: 'middle',
            x: 500,
            y: 250
        },
        {
            name: 'end',
            x: 1000,
            y: 500
        },
        {
            name: 'center',
            x: 500,
            y: 500
        },
    ]);

    points$ = this.pointsSource.asObservable().pipe(
        map(points => points.sort((a, b) => a.x - b.x))
    );

    private selectedPointSource = new BehaviorSubject<Point | null>(null);
    selectedPoint$ = this.selectedPointSource.asObservable();

    addPoint(point: Point) {
        const currentPoints = this.pointsSource.getValue();
        this.pointsSource.next([...currentPoints, point]);
    }

    selectPoint(point: Point) {
        this.selectedPointSource.next(point);
    }
}
