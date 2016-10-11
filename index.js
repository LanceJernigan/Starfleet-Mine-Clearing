import {getInitialState, zLookup} from './utils'

const actions = {
  north: sprites => sprites.map( sprite => sprite.type === 'player' ? Object.assign(sprite, {y: sprite.y - 1}) : sprite ),
  south: sprites => sprites.map( sprite => sprite.type === 'player' ? Object.assign(sprite, {y: sprite.y + 1}) : sprite ),
  east: sprites => sprites.map( sprite => sprite.type === 'player' ? Object.assign(sprite, {x: sprite.x + 1}) : sprite ),
  west: sprites => sprites.map( sprite => sprite.type === 'player' ? Object.assign(sprite, {x: sprite.x - 1}) : sprite ),
  alpha: sprites => {
    
    let player = sprites.filter( sprite => sprite.type === 'player').shift()
    
    return [[player.x - 1, player.y - 1], [player.x - 1, player.y + 1], [player.x + 1, player.y - 1], [player.x + 1, player.y + 1]].reduce( (pre, curr) => actions.attack(pre, curr), sprites )
    
  },
  beta: sprites => {
    
    let player = sprites.filter( sprite => sprite.type === 'player').shift()
    
    return [[player.x - 1, player.y], [player.x, player.y - 1], [player.x, player.y + 1], [player.x + 1, player.y]].reduce( (pre, curr) => actions.attack(pre, curr), sprites )
    
  },
  gamma: sprites => {
    
    let player = sprites.filter( sprite => sprite.type === 'player').shift()
    
    return [[player.x - 1, player.y], [player.x, player.y], [player.x + 1, player.y]].reduce( (pre, curr) => actions.attack(pre, curr), sprites )
    
  },
  delta: sprites => {
    
    let player = sprites.filter( sprite => sprite.type === 'player').shift()
    
    return [[player.x, player.y - 1], [player.x, player.y], [player.x, player.y + 1]].reduce( (pre, curr) => actions.attack(pre, curr), sprites )
    
  },
  attack: (sprites, coords, damage = 1) => {
  
    return sprites.map( sprite => (sprite.x === coords[0] && sprite.y === coords[1]) ? Object.assign(sprite, {hp: sprite.hp - damage}) : sprite)
    
  },
  default: sprites => coords
}

actions.north.type = 'move'
actions.south.type = 'move'
actions.west.type = 'move'
actions.east.type = 'move'
actions.alpha.type = 'attack'
actions.beta.type = 'attack'
actions.gamma.type = 'attack'
actions.delta.type = 'attack'

const render = ({sprites, z, moves, counter, score, attacks}) => {
  
  const remaining = sprites.filter( sprite => sprite.type !== 'player' && sprite.hp > 0 && sprite.z > z),
        setState = setStateFor({sprites: sprites, z: z, moves: moves, counter: counter, score: score, attacks})
  
  if (remaining.length) {
    
    const move = moves[z].split(' ')
    const newCount = addCounter({move: moves[z], counter: counter})
    
    display('Step ' + (z + 1))
    
    display(buildBoard({sprites: sprites, z: z}))
    
    sprites = move.reduce( (newSprites, action) => newSprites = actions[action](newSprites), sprites)
    
    display(moves[z])
    
    display(buildBoard({sprites: sprites, z: (z + 1)}))
    
    setState({
      z: z + 1,
      counter: newCount,
      sprites: sprites
    })
    
  } else {
    
    const score = calculateScore({sprites: sprites, z: z, counter: counter, moves: moves})
    
    display(score === 0 ? 'fail (0)' : 'pass (' + score + ')')
    
  }
  
}

const buildBoard = ({sprites, z}) => {
  
  const player = sprites.filter( sprite => sprite.type === 'player').shift(),
        maxY = sprites.reduce( (max, sprite) => sprite.hp > 0 && Math.abs(sprite.y - player.y > max) ? Math.abs(sprite.y - player.y) : max, 0),
        maxX = sprites.reduce( (max, sprite) => sprite.hp > 0 && Math.abs(sprite.x - player.x) > max ? Math.abs(sprite.x - player.x) : max, 0),
        maxHeight = (maxY * 2) + 1,
        maxWidth = (maxX * 2) + 1,
        offsetX = (player.x - Math.floor(maxWidth / 2)),
        offsetY = (player.y - Math.floor(maxHeight / 2)),
        board = '.'.repeat((maxHeight * maxWidth) - 1).split('.').reduce( (board, pos, i) => {
    
          const x = (i % maxWidth) + offsetX,
                y = (Math.floor(i / maxWidth)) + offsetY,
                row = Math.floor(i / maxWidth)
          
          board[row] += getPiece({x: x, y: y, z: z, sprites: sprites})
          
          return board
          
        }, '.'.repeat(maxHeight - 1).split('.'))
  
  return board
  
}

const getPiece = ({x, y, z, sprites}) => {
  
  const sprite = sprites.filter( sprite => sprite.type !== 'player' && sprite.x === x && sprite.y === y).shift()
  
  return (sprite && sprite.x === x && sprite.y === y && sprite.hp > 0) ? (sprite.z - (z + 1)) > 0 ? zLookup[sprite.z - (z + 1)] : '*' : '.'
  
}

const display = input => {
  
  Array.isArray(input) ? input.forEach( i => console.log(i)) : console.log(input)
  console.log('')
  
}

const addCounter = ({move, counter}) => {
  
  const moves = move.split(' ').map( m => actions[m].type )
  
  return {
    moves: moves.indexOf('move') >= 0 ? counter.moves ? counter.moves + 1 : 1 : counter.moves,
    attacks: moves.indexOf('attack') >= 0 ? counter.attacks ? counter.attacks + 1 : 1 : counter.attacks,
    total: counter.total + 1 || 1
  }
  
}

const calculateScore = ({sprites, z, counter, moves}) => {
  
  const completed = moves.length <= z,
        mines = sprites.filter( sprite => sprite.type !== 'player'),
        missed = sprites.filter( sprite => sprite.type !== 'player' && sprite.z <= z),
        remaining = sprites.filter( sprite => sprite.type !== 'player' && sprite.hp > 0),
        calculated = (10 * mines.length) - (counter.attacks > 5 ? 25 : (counter.attacks * 5)) - ((counter.moves * 2) > (mines.length * 3) ? (mines.length * 3) : (counter.moves * 2))
  
  return completed ? remaining.length || missed.length ? 0 : calculated : remaining.length ? 0 : 1
  
}

const setStateFor = state => newState => {
  
  state = {
    ...state,
    ...newState
  }
  
  render(state)
}

getInitialState().then(render)