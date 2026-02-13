export {};
// describe('State module', () => {
//     describe('reducer function', () => {
//         it.scoped('should update state based on dispatched messages', () => Effect.gen(function*() {
//             const initialState = { count: 0 }
//             type State = typeof initialState
//             type Msg = { _tag: 'INCREMENT' }
//             const counter = yield* State.reducer<State, Msg>(
//                 initialState,
//                 (state, msg) => Match.type<Msg>().pipe(
//                     Match.tag('INCREMENT', () => Effect.succeed({...state, count: state.count + 1})),
//                     Match.exhaustive
//                 )(msg)
//             )
//             const getCount = yield* Stream.toPull<State,never,never>(counter.stream)
//             let result = yield* getCount
//             expect(result[0].count).toEqual(0)
//             counter.dispatch({ _tag: 'INCREMENT' })
//             result = yield* getCount
//             expect(result[0].count).toEqual(1)
//         }))
//     })
//     describe('simple function', () => {
//         it.scoped('should set new value with set method', () => Effect.gen(function*() {
//             const counter = yield* State.simple<number>(0)
//             const getCount = yield* Stream.toPull<number,never,never>(counter.stream)
//             let result = yield* getCount
//             expect(result[0]).toEqual(0)
//             counter.set(1)
//             result = yield* getCount
//             expect(result[0]).toEqual(1)
//         }))
//         it.scoped('should update value with update method', () => Effect.gen(function*() {
//             const counter = yield* State.simple<number>(0)
//             const getCount = yield* Stream.toPull<number,never,never>(counter.stream)
//             let result = yield* getCount
//             expect(result[0]).toEqual(0)
//             counter.update(count => count +1)
//             result = yield* getCount
//             expect(result[0]).toEqual(1)
//         }))
//     })
//     // describe('async function', () => {
//     //     it.scoped('should return loading and success states for async effect', () => Effect.gen(function*() {
//     //         const asyncFn = async () => {
//     //             setTimeout(() => {}, 2000)
//     //             return 0
//     //         }
//     //         const asyncEffect = Effect.promise<number>(asyncFn)
//     //         const result = State.async(asyncEffect)
//     //         const getState = yield* Stream.toPull<State.Result<number, never>, never, never>(result.stream)
//     //         let state = yield* getState
//     //         expect(result.is('Loading')(state)).toBeTruthy()
//     //         setTimeout(() => {}, 2000)
//     //         state = yield* getState
//     //         expect(result.is('Success')(state) && state.data).toEqual(0)
//     //     }))
//     //     it.scoped('should return error state for failed async effect', () => Effect.gen(function*() {
//     //         class TestError extends Data.Error<{ message: string }> {}
//     //         const asyncEffect = Effect.gen(function*() {
//     //             setTimeout(() => {}, 2000)
//     //             yield* new TestError({message: 'an error'})
//     //             return 0
//     //         })
//     //         const result = State.async(asyncEffect)
//     //         const getState = (yield* Stream.toPull<State.Result<number, TestError>, never, never>(result.stream)).pipe(
//     //             Effect.andThen(chunk => Chunk.head(chunk))
//     //         )
//     //         let state = yield* getState
//     //         expect(result.is('Loading')(state)).toBeTruthy()
//     //         setTimeout(() => {}, 2000)
//     //         state = yield* getState
//     //         expect(result.is('Failure')(state) && state.error.message).toEqual('an error')
//     //     }))
//     // })
// })
//# sourceMappingURL=State.test.js.map