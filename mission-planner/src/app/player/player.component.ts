import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { PointService } from '../services/point.service';
import { Point } from '../models/point.model';
import { MatCard, MatCardContent } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatList, MatListItem } from '@angular/material/list';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-player',
    standalone: true,
    imports: [
        CommonModule,
        MatCard,
        MatCardContent,
        MatButton,
        MatList,
        MatListItem
    ],
    templateUrl: './player.component.html',
    styleUrl: './player.component.scss'
})
export class PlayerComponent implements OnInit, OnDestroy, AfterViewInit {
    private unsubscribe$ = new Subject<void>();
    @ViewChild('robot') robotElement!: ElementRef;
    @ViewChild('svg') svgElement!: ElementRef;
    points$ = this.pointService.points$;
    selectedPoint$ = this.pointService.selectedPoint$;
    currentPointIndex = 0;
    playInterval!: number;
    isPlaying = false;
    svgWidth = 1500;
    svgHeight = 500;

    constructor(
        public pointService: PointService,
        private renderer: Renderer2
    ) {
    }

    ngOnInit(): void {
        this.selectedPoint$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(point => {
                if (point) {
                    this.moveRobot(point);
                }
            });
    }

    ngAfterViewInit(): void {
        this.points$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(points => {
                this.pointService.selectPoint(points[0]);
                this.drawLines(points);
            });
    }

    drawLines(points: Point[]) {
        if (this.svgElement) {
            const svg: SVGSVGElement = this.svgElement.nativeElement;
            svg.innerHTML = '';

            for (let i = 1; i < points.length; i++) {
                const line = this.renderer.createElement('line', 'svg');
                this.renderer.setAttribute(line, 'x1', `${points[i - 1].x}`);
                this.renderer.setAttribute(line, 'y1', `${points[i - 1].y}`);
                this.renderer.setAttribute(line, 'x2', `${points[i].x}`);
                this.renderer.setAttribute(line, 'y2', `${points[i].y}`);
                this.renderer.setAttribute(line, 'stroke', 'black');
                this.renderer.appendChild(svg, line);
            }
        }
    }

    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        const points = this.pointService.pointsSource.getValue();

        if (points.length === 0) return;

        this.moveToPoint(this.currentPointIndex);

        this.playInterval = window.setInterval(() => {
            if (this.currentPointIndex >= points.length - 1) {
                this.stop();
                return;
            }

            this.currentPointIndex++;
            this.moveToPoint(this.currentPointIndex);
        }, 1000);
    }

    moveToPoint(index: number) {
        const points = this.pointService.pointsSource.getValue();
        this.moveRobot(points[index]);
    }

    stop() {
        if (!this.isPlaying) return;
        clearInterval(this.playInterval);
        this.isPlaying = false;
    }

    moveRobot(point: Point) {
        if (this.robotElement) {
            const robotElement = this.robotElement.nativeElement;
            const transformValue = `translate(${point.x}px, ${point.y}px)`;
            this.renderer.setStyle(robotElement, 'transform', transformValue);
        }
    }

    selectPoint(point: Point) {
        this.pointService.selectPoint(point);
    }

    ngOnDestroy() {
        this.stop();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
