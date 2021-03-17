import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { w3cwebsocket as W3CWebSocket } from 'websocket'
import PropTypes from 'prop-types'

const client = new W3CWebSocket('ws://127.0.0.1:9090')

function Square (props) {
  return (
    <button
        className="square"
        onClick={() => props.onClick()}
    >
        {props.value}
    </button>
  )
}

Square.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func
}

class Board extends React.Component {
  renderSquare (i) {
    return (
      <Square
        value={ this.props.squares[i] }
        onClick={ () => this.props.onClick(i) }
      />
    )
  }

  render () {
    return (
      <div>
        <div className="board-row">
          { this.renderSquare(0) }
          { this.renderSquare(1) }
          { this.renderSquare(2) }
        </div>
        <div className="board-row">
          { this.renderSquare(3) }
          { this.renderSquare(4) }
          { this.renderSquare(5) }
        </div>
        <div className="board-row">
          { this.renderSquare(6) }
          { this.renderSquare(7) }
          { this.renderSquare(8) }
        </div>
      </div>
    )
  }
}

Board.propTypes = {
  squares: PropTypes.array,
  onClick: PropTypes.func
}

class Game extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      clientId: null,
      gameId: null,
      xIsNextPlayer: true,
      xPlayerId: null,
      playerSymbol: 'not defined yet',
      board: Array(9).fill(null),
      status: ''
    }
    this.playGame = this.playGame.bind(this)
    this.startGame = this.startGame.bind(this)
  }

  componentDidMount () {
    client.onopen = () => {
      console.log('WebSocket Client Connected')
      const payLoad = {
        method: 'connect'
      }
      client.send(JSON.stringify(payLoad))
    }
    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data)
      console.log('Got reply! ', dataFromServer)

      switch (dataFromServer.method) {
        case 'connect': {
          this.setState({ clientId: dataFromServer.clientId })
          console.log('Client successfully connected with id ' + this.state.clientId)
          break
        }
        case 'create': {
          this.setState({ gameId: dataFromServer.game.gameId })
          console.log('Game successfully created with id ' + dataFromServer.game.gameId)
          break
        }
        case 'join': {
          if (dataFromServer.gameId === '') {
            alert('There are no available games to join')
          } else {
            this.setState({ gameId: dataFromServer.gameId })
            this.setState({ xPlayerId: dataFromServer.xPlayerId })
            this.setState({ xIsNextPlayer: dataFromServer.xIsNextPlayer })
            dataFromServer.xPlayerId === this.state.clientId
              ? this.setState({ playerSymbol: 'X' })
              : this.setState({ playerSymbol: 'O' })
          }
          break
        }
        case 'play': {
          switch (dataFromServer.gameStatus) {
            case 'X':
              this.setState({ status: 'Winner is X' })
              break
            case 'O':
              this.setState({ status: 'Winner is O' })
              break
            case 'undecided':
              this.setState({ status: 'Game is undecided' })
              break
            case 'in process':
              break
            default:
              break
          }
          this.setState({ board: dataFromServer.board })
          this.setState({ xIsNextPlayer: dataFromServer.xIsNextPlayer })
          break
        }
        default:
          break
      }
    }
  }

  startGame (clientId, method) {
    const payLoad = {
      method,
      clientId
    }
    client.send(JSON.stringify(payLoad))
  }

  playGame (i) {
    if (this.state.status !== '') {
      return
    }
    const boardState = this.state.board
    if (boardState[i] !== null) {
      return
    }
    boardState[i] = this.state.playerSymbol
    if (this.state.xIsNextPlayer && this.state.playerSymbol === 'X') {
      this.setState({ board: boardState })
      const payLoad = {
        method: 'play',
        board: this.state.board,
        gameId: this.state.gameId,
        xIsNextPlayer: false
      }
      client.send(JSON.stringify(payLoad))
    }
    if (!this.state.xIsNextPlayer && this.state.playerSymbol === 'O') {
      this.setState({ board: boardState })
      const payLoad = {
        method: 'play',
        board: this.state.board,
        gameId: this.state.gameId,
        xIsNextPlayer: true
      }
      client.send(JSON.stringify(payLoad))
    }
  }

  render () {
    return (
      <div className="game">
        { this.state.gameId === null
          ? <div className="game-buttons">
            <button onClick={() => this.startGame(this.state.clientId, 'create')}>
                New Game
            </button>
            <button onClick={() => this.startGame(this.state.clientId, 'join')}>
                Join Game
            </button>
          </div>
          : <div>
            <label>Game id: {this.state.gameId}</label>
            <div className="game-board">
                <Board
                    squares={this.state.board}
                    onClick={(i) => this.playGame(i)}
                />
            </div>
            <div className="game-info">
                { this.state.status !== ''
                  ? <div>{ this.state.status }</div>
                  : <div>
                    <div>
                        My symbol is { this.state.playerSymbol }.
                    </div>
                    <div>
                        Next player is { this.state.xIsNextPlayer ? 'X' : 'O' }.
                    </div>
                  </div>
                }
            </div>
          </div>
        }
      </div>
    )
  }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
)
