import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { PointService } from '../services/point.service';
import { Point } from '../models/point.model';
import { MatCard, MatCardContent } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatList, MatListItem, MatNavList } from '@angular/material/list';
import { interval, Subject, Subscription, takeUntil, takeWhile } from 'rxjs';

@Component({
    selector: 'app-player',
    standalone: true,
    imports: [
        CommonModule,
        MatCard,
        MatCardContent,
        MatButton,
        MatList,
        MatListItem,
        MatNavList
    ],
    templateUrl: './player.component.html',
    styleUrl: './player.component.scss'
})
export class PlayerComponent implements OnInit, OnDestroy, AfterViewInit {
    private unsubscribe$ = new Subject<void>();
    private playSubscription?: Subscription;
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
            .pipe(
                takeUntil(this.unsubscribe$)
            )
            .subscribe(point => {
                if (point) {
                    this.moveRobot(point);
                }
            });
    }

    ngAfterViewInit(): void {
        this.points$
            .pipe(
                takeUntil(this.unsubscribe$)
            )
            .subscribe(points => {
                if (points?.length > 0) {
                    this.pointService.selectPoint(points[0]);
                    this.drawLines(points);
                }
            });
    }

    drawLines(points: Point[]): void {
        if (!this.svgElement) {
            console.error('SVG Element is not available.');
            return;
        }

        const svg: SVGSVGElement = this.svgElement.nativeElement;
        const fragment = document.createDocumentFragment();

        svg.innerHTML = '';

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        fragment.appendChild(group);

        points.forEach((point, index) => {
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', `${point.x}`);
            dot.setAttribute('cy', `${point.y}`);
            dot.setAttribute('r', '3'); // Radius of the dot
            dot.setAttribute('fill', 'black');
            group.appendChild(dot);

            if (index > 0) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', `${points[index - 1].x}`);
                line.setAttribute('y1', `${points[index - 1].y}`);
                line.setAttribute('x2', `${point.x}`);
                line.setAttribute('y2', `${point.y}`);
                line.setAttribute('stroke', 'black');
                line.setAttribute('stroke-dasharray', '5,5');
                group.appendChild(line);
            }
        });

        svg.appendChild(fragment);
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        const points = this.pointService.pointsSource.getValue();
        if (points.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.playSubscription = interval(1000).pipe(
            takeWhile(() => this.isPlaying && this.currentPointIndex < points.length)
        ).subscribe({
            next: () => {
                this.moveToPoint(this.currentPointIndex++);
            },
            complete: () => this.stop()
        });
    }

    moveToPoint(index: number) {
        const points = this.pointService.pointsSource.getValue();
        if (index < points.length) {
            this.moveRobot(points[index]);
        }
    }

    stop() {
        if (this.isPlaying) {
            this.isPlaying = false;
            this.playSubscription?.unsubscribe();
            this.playSubscription = undefined;
        }
    }

    moveRobot(point: Point) {
        if (this.robotElement && point) {
            const robotElement = this.robotElement.nativeElement;
            const transformValue = `translate(${point.x}px, ${point.y}px)`;
            this.renderer.setStyle(robotElement, 'transform', transformValue);
        }
    }

    selectPoint(point: Point) {
        if (point) {
            this.pointService.selectPoint(point);
        }
    }

    ngOnDestroy() {
        this.stop();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
