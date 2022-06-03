## Animations with Coroutines

This is the code sample repo for this [blog post](https://erikonarheim.com/posts/animating-with-coroutines) which demonstrates how to build animations in JavaScript using coroutines!

```typescript
coroutine(function* manyBoxesAnimation() {
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
        )
    )
})
```

### Running locally

* Install nodejs @ v16 https://nodejs.org/en/
* Run `npm install`
* Run `npm start`
* Navigate to `localhost:1234` to play with animations