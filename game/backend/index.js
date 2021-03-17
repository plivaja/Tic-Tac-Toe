const { v4: uuidv4 } = require('uuid')
const http = require('http')
const websocketServer = require('websocket').server

const httpServer = http.createServer()
httpServer.listen(9090, () => console.log('Listening on port 9090'))

//spinning the http server and the websocket server
const wsServer = new websocketServer({
    'httpServer': httpServer,
})

var clients = {}
var games = []
var boards = {}

wsServer.on ('request', (request) => {
  const connection = request.accept(null, request.origin)
  const clientId = uuidv4()

  console.log((new Date()) + ' Received a new connection from origin ' + request.origin + '.')

  clients[clientId] = connection
  console.log('connected: ' + clientId + ' in ' + Object.getOwnPropertyNames(clients))

  connection.on ('open', () => console.log('Opened!'))
  connection.on ('close', () => console.log('Closed!'))
  connection.on ('message', message => {
    if (message.type === 'utf8') {
        console.log('SERVER: Received Message: ', message.utf8Data)
    }
    const dataFromClient = JSON.parse(message.utf8Data)
    switch (dataFromClient.method) {
      case 'connect': {
        const payLoad = {
          method: 'connect',
          clientId
        }
        const con = clients[clientId]
        con.send(JSON.stringify(payLoad))
        break
      }
      case 'create': {
        const clientId = dataFromClient.clientId
        const gameId = uuidv4()
        boards[gameId] = Array(9).fill(null)
        games.push ({
          gameId,
          clients: [clientId],
          createdAt: new Date()
        })
        const payLoad = {
          method: 'create',
          game: games[games.length-1]
        }
        const con = clients[clientId]
        con.send(JSON.stringify(payLoad))
        break
      }
      case'join': {
        const clientId = dataFromClient.clientId
        if (!games.length) {
          let payLoad = {
            method: 'join',
            gameId: ''
          }
          const con = clients[clientId]
          con.send(JSON.stringify(payLoad))
          return
        }
        var gamesWithOnePlayer = games.filter(g => g.clients.length === 1)
        if (!gamesWithOnePlayer.length) {
          let payLoad = {
            method: 'join',
            gameId: ''
          }
          const con = clients[clientId]
          con.send(JSON.stringify(payLoad))
          return
        }
        var selectedGame = gamesWithOnePlayer[0]
        selectedGame.clients.push(clientId)
        console.log('Player ', clientId, ' successfully joined the game ', selectedGame.gameId)
        const selection = Math.floor(Math.random() * 2)
        let payLoad = {
          method: 'join',
          gameId: selectedGame.gameId,
          xPlayerId: selectedGame.clients[selection],
          xIsNextPlayer: true
        }
        let game = games.filter(g => g.gameId === selectedGame.gameId)[0]
        const con1 = clients[game.clients[0]]
        const con2 = clients[game.clients[1]]
        con1.send(JSON.stringify(payLoad))
        con2.send(JSON.stringify(payLoad))
        break
      }
      case 'play': {
        boards[dataFromClient.gameId] = dataFromClient.board
        let board = boards[dataFromClient.gameId]
        let gameStatus = checkGameStatus(board)
        console.log(gameStatus)
        const payLoad = {
          method: 'play',
          gameStatus,
          board,
          xIsNextPlayer: dataFromClient.xIsNextPlayer
        }
        let game = games.filter(g => g.gameId === dataFromClient.gameId)[0]
        const con1 = clients[game.clients[0]]
        const con2 = clients[game.clients[1]]
        con1.send(JSON.stringify(payLoad))
        con2.send(JSON.stringify(payLoad))
        break
      }
    }
  })
})

function checkGameStatus(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
      return squares[a]
  }
  if (squares.filter(b => b === null).length===0)
    return 'undecided'
  return 'in process'
}
