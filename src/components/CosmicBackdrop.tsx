import { useEffect, useRef } from "react";

type MeshPoint = {
  x: number;
  y: number;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function CosmicBackdrop() {
  const meshRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = meshRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;
    let lastFrameTime = 0;
    let reducedMotion = motionQuery.matches;
    let width = 1;
    let height = 1;
    let axisY = 1;
    let stageHeight = 1;

    const resize = () => {
      const canvasBounds = canvas.getBoundingClientRect();
      const timelineBounds = document
        .querySelector<HTMLElement>(".timeline-stage")
        ?.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

      width = Math.max(1, Math.round(canvasBounds.width));
      height = Math.max(1, Math.round(canvasBounds.height));
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (timelineBounds) {
        axisY =
          timelineBounds.top -
          canvasBounds.top +
          timelineBounds.height / 2;
        stageHeight = timelineBounds.height;
      } else {
        axisY = height * 0.42;
        stageHeight = height * 0.68;
      }
    };

    const traceThread = (points: MeshPoint[]) => {
      if (points.length < 2) return;

      context.moveTo(points[0].x, points[0].y);
      for (let index = 1; index < points.length - 1; index += 1) {
        const point = points[index];
        const nextPoint = points[index + 1];
        context.quadraticCurveTo(
          point.x,
          point.y,
          (point.x + nextPoint.x) / 2,
          (point.y + nextPoint.y) / 2,
        );
      }
      const finalPoint = points[points.length - 1];
      context.lineTo(finalPoint.x, finalPoint.y);
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      const seconds = time / 1000;
      const rowCount = width < 720 ? 9 : 13;
      const columnCount = Math.max(14, Math.ceil(width / 86) + 2);
      const halfRows = (rowCount - 1) / 2;
      const bandHalfHeight = clamp(stageHeight * 0.25, 150, 270);
      const rowGap = (bandHalfHeight * 2) / (rowCount - 1);
      const mesh: MeshPoint[][] = [];

      for (let row = 0; row < rowCount; row += 1) {
        const rowOffset = row - halfRows;
        const normalizedRow = rowOffset / halfRows;
        const points: MeshPoint[] = [];

        for (let column = 0; column < columnCount; column += 1) {
          const progress = column / (columnCount - 1);
          const baseX = progress * width;
          const horizontalEnvelope =
            0.42 + Math.sin(progress * Math.PI) * 0.58;
          const primaryWave =
            Math.sin(
              baseX * 0.0061 + seconds * 0.17 + row * 0.74,
            ) * 18;
          const crossWave =
            Math.sin(
              baseX * 0.0157 - seconds * 0.26 + row * 1.37,
            ) * 9;
          const longWave =
            Math.sin(
              baseX * 0.0023 + seconds * 0.11 - row * 0.49,
            ) * 25;
          const travellingRipple =
            Math.sin(
              baseX * 0.0108 -
                seconds * (0.31 + (row % 3) * 0.035) +
                row * 0.56,
            ) * 8;
          const rowDrift =
            Math.sin(seconds * 0.14 + row * 0.81) * 7;
          const xDrift =
            Math.sin(
              seconds * 0.12 + column * 0.91 + row * 0.43,
            ) *
            (3 + horizontalEnvelope * 3);

          points.push({
            x: baseX + xDrift,
            y:
              axisY +
              rowOffset * rowGap +
              (
                primaryWave +
                crossWave +
                longWave +
                travellingRipple
              ) *
                horizontalEnvelope *
                (0.88 + Math.abs(normalizedRow) * 0.16) +
              rowDrift,
          });
        }

        mesh.push(points);
      }

      const horizontalColor = context.createLinearGradient(
        0,
        0,
        width,
        0,
      );
      horizontalColor.addColorStop(0, "rgb(81 186 121 / 0)");
      horizontalColor.addColorStop(0.09, "rgb(81 186 121 / 0.18)");
      horizontalColor.addColorStop(0.5, "rgb(112 224 151 / 0.3)");
      horizontalColor.addColorStop(0.91, "rgb(81 186 121 / 0.18)");
      horizontalColor.addColorStop(1, "rgb(81 186 121 / 0)");

      context.save();
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = horizontalColor;

      for (let row = 0; row < rowCount; row += 1) {
        const distanceFromAxis = Math.abs(row - halfRows) / halfRows;
        context.globalAlpha = 1 - distanceFromAxis * 0.42;
        context.lineWidth = row === halfRows ? 1.15 : 0.72;
        context.beginPath();
        traceThread(mesh[row]);
        context.stroke();
      }

      context.globalCompositeOperation = "lighter";
      context.strokeStyle = "rgb(137 239 171 / 0.3)";
      context.lineWidth = 0.82;
      context.setLineDash([19, 48, 5, 76]);
      for (let row = 1; row < rowCount; row += 3) {
        context.globalAlpha = 0.52;
        context.lineDashOffset =
          -seconds * (16 + row * 0.7) + row * 21;
        context.beginPath();
        traceThread(mesh[row]);
        context.stroke();
      }
      context.setLineDash([]);

      const centralThread = mesh[Math.floor(halfRows)];
      context.globalAlpha = 0.86;
      context.strokeStyle = "rgb(117 233 158 / 0.32)";
      context.lineWidth = 1;
      context.shadowColor = "rgb(86 220 137 / 0.48)";
      context.shadowBlur = 13;
      context.beginPath();
      traceThread(centralThread);
      context.stroke();
      context.shadowBlur = 0;

      context.restore();
    };

    const animate = (time: number) => {
      if (time - lastFrameTime >= 1000 / 30) {
        draw(time);
        lastFrameTime = time;
      }
      frameId = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      window.cancelAnimationFrame(frameId);
      lastFrameTime = 0;
      if (reducedMotion) {
        draw(0);
      } else {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const handleMotionPreference = () => {
      reducedMotion = motionQuery.matches;
      startAnimation();
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion) draw(0);
    });

    resize();
    resizeObserver.observe(canvas);
    motionQuery.addEventListener("change", handleMotionPreference);
    startAnimation();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      motionQuery.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return (
    <div className="cosmic-backdrop" aria-hidden="true">
      <span className="cosmic-backdrop__mist cosmic-backdrop__mist--one" />
      <span className="cosmic-backdrop__mist cosmic-backdrop__mist--two" />
      <canvas
        ref={meshRef}
        className="cosmic-backdrop__temporal-mesh"
      />
      <span className="cosmic-backdrop__dust cosmic-backdrop__dust--near" />
      <span className="cosmic-backdrop__dust cosmic-backdrop__dust--far" />
      <span className="cosmic-backdrop__monolith cosmic-backdrop__monolith--left" />
      <span className="cosmic-backdrop__monolith cosmic-backdrop__monolith--right" />
    </div>
  );
}
