const base = require('./base');

Object.getOwnPropertyNames(base).map(p => global[p] = base[p])

// Constants
const NORTH = {x: 0, y: -1}
const SOUTH = {x: 0, y: 1}
const EAST = {x: 1, y: 0}
const WEST = {x: -1, y: 0}


const snakeFromFriendSnake = state => {
    return {
        ...state,
        moves: [...state.friendMoves],
        snake: [...state.friendSnake],
        isSuper: state.friendIsSuper,
        inverted: false
    }
};

// Point operations
const pointEq = p1 => p2 => p1.x == p2.x && p1.y == p2.y

// Booleans
const willEat = state => pointEq(nextHead(state))(state.apple)
// const willFriendEat = state => willEat(snakeFromFriendSnake(state))
const willEatSuperApple = state => pointEq(nextHead(state))(state.superApple)
// const willFriendEatSuperApple = state => willEatSuperApple(snakeFromFriendSnake(state))


const willSnakeHeadsIntersect = state =>  {
    pointEq(nextHead(state), nextFriendHead(state))
    return false;
}
const willCrash = state => {
    return state.snake.find(pointEq(nextHead(state))) || willSnakeHeadsIntersect(state)
}
// const friendWillCrash = state => willCrash(snakeFromFriendSnake(state))
const validMove = move => state => state.moves[0].x + move.x != 0 || state.moves[0].y + move.y != 0

// Next values based on state
const nextMoves = state => state.moves.length > 1 ? dropFirst(state.moves) : state.moves
const nextApple = state => willEat(state) || willFriendEat(state) ? rndPos(state) : state.apple
const nextSuperApple = state => willEatSuperApple(state) || willFriendEatSuperApple(state) ? rndPos(state) : state.superApple
const nextSuper = (state) => {
    if (state.isSuper) {
        return !willEatSuperApple(state)
    } else {
        return willEatSuperApple(state)
    }
}

// const nextFriendSuper = (state) => nextSuper(snakeFromFriendSnake(state));
const nextHead = state => state.snake.length == 0
    ? {x: 2, y: 2}
    : {
        x: mod(state.cols)(state.snake[0].x + state.moves[0].x),
        y: mod(state.rows)(state.snake[0].y + state.moves[0].y)
    }

const nextFriendHead = (state) => {
    return nextHead(snakeFromFriendSnake(state));
}


const nextSnake = state => willCrash(state) ? [] : (willEatAppleOrSuperApple(state) ? enlargeSnake(state) : [nextHead(state)].concat(dropLast(state.snake)));

// const nextFriendSnake = state => nextSnake(snakeFromFriendSnake(state));
// // Randomness
// const rndPos = table => ({
//     x: rnd(0)(table.cols - 1),
//     y: rnd(0)(table.rows - 1)
// })

// const nextFriendMoves = state => nextMoves(snakeFromFriendSnake(state));


const enlargeSnake = state => [nextHead(state)].concat(state.isSuper ? [...state.snake, ...state.snake] : state.snake)

const willEatAppleOrSuperApple = state => willEat(state) || willEatSuperApple(state);

// Initial state
const initialState = () => ({
    cols: 40,
    rows: 30,
    moves: [EAST],
    snake: [],
    apple: {x: 16, y: 2},
    superApple: {x: 8, y: 18},
    isSuper: false,
    // friendMoves: [NORTH],
    // friendSnake: [ {x: 10, y: 20}, {x: 11, y: 20}],
    // friendIsSuper: false
});

const next = spec({
    rows: prop('rows'),
    cols: prop('cols'),
    moves: nextMoves,
    snake: nextSnake,
    apple: nextApple,
    superApple: nextSuperApple,
    isSuper: nextSuper,
    // friendSnake: nextFriendSnake,
    // friendMoves: nextFriendMoves,
    // friendIsSuper: nextFriendSuper
})

const enqueueFriend = (state, move) => validMove(move)(snakeFromFriendSnake(state)) ? merge(state)({friendMoves: state.friendMoves.concat([move]), inverted: false}) : state;

const enqueue = (state, move) => validMove(move)(state) ? merge(state)({moves: state.moves.concat([move])}) : state;

module.exports = {EAST, NORTH, SOUTH, WEST, initialState, enqueue, next, enqueueFriend}
