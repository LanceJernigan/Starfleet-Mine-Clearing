import fs from 'fs'

export const zLookup = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

const readFile = (path, encoding = 'utf8') => new Promise((resolve, reject)=> {
  
  fs.readFile(path, encoding, (err, res) => err ? reject(err) : resolve(res))
  
})

const getBoard = () => readFile('./assets/board.txt')

const getMoves = () => readFile('./assets/actions.txt')

const buildMoves = moves => moves.split('\n')

const buildSprites = board => [...board.split('\n').reduce( (sprites, row, y) => {
  
  return [...sprites, ...row.split('').reduce( (_sprites, piece, x) => {
    
    return piece === '.' ? _sprites : [..._sprites, {
      type: 'mine',
      x: x,
      y: y,
      z: zLookup.indexOf(piece),
      hp: 1
    }]
    
  }, [])]
  
}, []), {
    type: 'player',
    x: Math.floor(board.split('\n').shift().length / 2),
    y: Math.floor(board.split('\n').length / 2),
    z: 0
  }]

export const getInitialState = () => {
  
  const boardPromise = getBoard()
  const movesPromise = getMoves()
  
  const getData = Promise.all([boardPromise, movesPromise])
  
  return getData.then( ([board, moves]) => {
    
    const state = {
      z: 0,
      score: 0,
      moves: buildMoves(moves),
      sprites: buildSprites(board),
      counter: {
        moves: 0,
        attacks: 0,
        total: 0
      }
    }
    
    return state
    
  })
  
}