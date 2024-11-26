import { Point, SmoothBrushUpdateOptions, SmoothBrushOptions } from "../types";

function smoothEase(x: number): number {
  return 1 - Math.sqrt(1 - Math.pow(x, 2));
}

class SmoothPoint implements Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(point: Point): SmoothPoint {
    this.x = point.x;
    this.y = point.y;
    return this;
  }

  moveByAngle(angle: number, distance: number, friction?: number): SmoothPoint {
    const angleRotated = angle + Math.PI / 2;

    if (friction) {
      this.x = this.x + Math.sin(angleRotated) * distance * smoothEase(1 - friction);
      this.y = this.y - Math.cos(angleRotated) * distance * smoothEase(1 - friction);
    } else {
      this.x = this.x + Math.sin(angleRotated) * distance;
      this.y = this.y - Math.cos(angleRotated) * distance;
    }

    return this;
  }

  equalsTo(point: Point): boolean {
    return this.x === point.x && this.y === point.y;
  }

  getDifferenceTo(point: Point): SmoothPoint {
    return new SmoothPoint(this.x - point.x, this.y - point.y);
  }

  getDistanceTo(point: Point): number {
    const diff = this.getDifferenceTo(point);
    return Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
  }

  getAngleTo(point: Point): number {
    const diff = this.getDifferenceTo(point);
    return Math.atan2(diff.y, diff.x);
  }

  toObject(): Point {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

class SmoothBrush {
  isEnabled: boolean;
  hasMoved: boolean;
  radius: number;
  pointer: SmoothPoint;
  brush: SmoothPoint;
  angle: number;
  distance: number;

  constructor(options: SmoothBrushOptions = {}) {
    const initialPoint = options.initialPoint || { x: 0, y: 0 };
    this.radius = options.radius || 30;
    this.isEnabled = options.enabled === false ? false : true;

    this.pointer = new SmoothPoint(initialPoint.x, initialPoint.y);
    this.brush = new SmoothPoint(initialPoint.x, initialPoint.y);

    this.angle = 0;
    this.distance = 0;
    this.hasMoved = false;
  }

  update(newPointerPoint: Point, options: SmoothBrushUpdateOptions = {}): boolean {
    this.hasMoved = false;
    if (
      this.pointer.equalsTo(newPointerPoint) &&
      !options.both &&
      !options.friction
    ) {
      return false;
    }

    this.pointer.update(newPointerPoint);

    if (options.both) {
      this.hasMoved = true;
      this.brush.update(newPointerPoint);
      return true;
    }

    if (this.isEnabled) {
      this.distance = this.pointer.getDistanceTo(this.brush);
      this.angle = this.pointer.getAngleTo(this.brush);

      const isOutside = Math.round((this.distance - this.radius) * 10) / 10 > 0;
      const friction =
        options.friction && options.friction < 1 && options.friction > 0
          ? options.friction
          : undefined;

      if (isOutside) {
        this.brush.moveByAngle(
          this.angle,
          this.distance - this.radius,
          friction
        );
        this.hasMoved = true;
      }
    } else {
      this.distance = 0;
      this.angle = 0;
      this.brush.update(newPointerPoint);
      this.hasMoved = true;
    }

    return true;
  }

  getBrushCoordinates(): Point {
    return this.brush.toObject();
  }
}

export default SmoothBrush;