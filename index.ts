
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

class Entity {
    x: number = 0;
    y: number = 0;
    rotation: number = 0;
    scale: number = 1;
    color: string = 'red';
}

function coroutine(generatorFunction: () => Generator<any, void, number>) {
    const generator = generatorFunction(); // instantiate the coroutine
    generator.next(); // execute until the first yield
    return (x: number) => {
        return generator.next(x);
    }
}

// time is between 0 and 1
const lerp = (start: number, end: number, time: number) => {
    return start * (1-time) + end * time;
}
const clamp = (val: number, min: number, max: number) => {
    return Math.min(max, Math.max(val, min));
}

function* delay(durationMs: number): Generator<void, void, number> {
    let totalTime = 0;
    while(true) {
        let elapsed = yield;
        totalTime += elapsed;
        if (totalTime >= durationMs){
            return;
        }
    }
}

function* moveTo(entity: Entity, destination: {x: number, y: number}, durationMs: number): Generator<void, void, number> {
    let totalTime = 0;
    const { x: originalX, y: originalY} = entity;
    while(true) {
        let elapsed = yield;
        totalTime += elapsed;
        const currentTime = clamp(totalTime / durationMs, 0, 1);
        const currentX = lerp(originalX, destination.x, currentTime);
        const currentY = lerp(originalY, destination.y, currentTime);
        entity.x = currentX;
        entity.y = currentY;
        if (totalTime >= durationMs) {
            console.log('moveTo complete', currentX, currentY);
            return;
        }
        
    }
}

function* rotateTo(entity: Entity, angle: number, durationMs: number): Generator<void, void, number> {
    let totalTime = 0;
    const {rotation: sourceAngle } = entity;
    while (true) {
        let elapsed = yield;
        totalTime += elapsed;
        const currentTime = clamp(totalTime / durationMs, 0, 1);
        const currentRotation = lerp(sourceAngle, angle, currentTime);
        entity.rotation = currentRotation;
        if (totalTime >= durationMs) {
            console.log('rotateTo complete', currentRotation);
            return;
        }
    }
}

function* scaleTo(entity: Entity, scale: number, durationMs: number): Generator<void, void, number> {
    let totalTime = 0;
    const {scale: sourceScale } = entity;
    while (true) {
        let elapsed = yield;
        totalTime += elapsed;
        const currentTime = clamp(totalTime / durationMs, 0, 1);
        const currentScale = lerp(sourceScale, scale, currentTime);
        entity.scale = currentScale;
        if (totalTime >= durationMs) {
            console.log('scaleTo complete', currentScale);
            return;
        }
    }
}

function* parallel(...functions: Generator[]): Generator<void, void, number> {
    while (true) {
        let elapsed = yield;
        let results: IteratorResult<any, any>[] = [];
        for (let fcn of functions) {
            results.push(fcn.next(elapsed));
        }
        if (results.every(f => f.done)){
            return;
        }
    }
}

function sequence(...args: Generator[]) {
    return function* generatorSequence() {
        for(let generator of args) {
            yield* generator;
        }
    }();
}

const entities: Entity[] = [];

entities.push(new Entity());
entities.push(new Entity());
entities.push(new Entity());
const redEntity = entities[0];
const yellowEntity = entities[1];
const greenEntity = entities[2];

yellowEntity.color = 'yellow';
yellowEntity.x = 50;
yellowEntity.y = 50;

greenEntity.color = 'green';
greenEntity.x = 50;
greenEntity.y = 50;

let animations: ((elapsed: number) => IteratorResult<void, void>)[] = [];


const anim = coroutine(function* animation() {
    const before = performance.now();
    yield* delay(2000);

    yield* parallel(
        moveTo(yellowEntity, {x: 50, y: 50}, 1000),
        moveTo(redEntity, {x: 200, y: 200}, 1000)
    )
    yield* delay(1000);
    yield* parallel(
        sequence(
            moveTo(yellowEntity, {x: 50, y: 550}, 1000),
            moveTo(yellowEntity, {x: 750, y: 550}, 1000),
            moveTo(yellowEntity, {x: 750, y: 50}, 1000),
            moveTo(yellowEntity, {x: 50, y: 50}, 1000),
        ),
        sequence(
            moveTo(greenEntity, {x: 750, y: 50}, 1000),
            moveTo(greenEntity, {x: 750, y: 550}, 1000),
            moveTo(greenEntity, {x: 50, y: 550}, 1000),
            moveTo(greenEntity, {x: 50, y: 50}, 1000),
        ),
        rotateTo(redEntity, Math.PI, 1000),
        scaleTo(redEntity, 2, 1000),
        sequence(
            delay(500),
            moveTo(redEntity, {x: 300, y: 300}, 500)
        )
    );
    yield* scaleTo(redEntity, .1, 1000);
    yield* moveTo(redEntity, {x: 200, y: 100}, 500);
    yield* rotateTo(redEntity, 4*Math.PI, 1000);

    console.log('animation complete', performance.now() - before);
});

animations.push(anim);

const draw = (ctx: CanvasRenderingContext2D, elapsedMs: number) => {
    for (let entity of entities) {
        ctx.save();
        ctx.translate(entity.x, entity.y);
        ctx.rotate(entity.rotation);
        ctx.scale(entity.scale, entity.scale);
        ctx.fillStyle = entity.color;
        ctx.fillRect(-50, -50, 100, 100);
        ctx.restore();
    }
}

const clear = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#176BAA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

let lastTime = performance.now();
let running = true;
const mainloop = (time: number) => {
    try {
        if (!running) return;
        requestAnimationFrame(mainloop);

        const now = time;
        const elapsed = now - lastTime;
        // update stuff
        for (let animation of animations) {
            animation(elapsed);
        }
        
        // draw stuff
        lastTime = now;
        clear(ctx);
        draw(ctx, elapsed)
    } catch(e) {
        running = false;
        throw e;
    }
}
mainloop(performance.now());




