

# Tic-Tac-Toe-Game

**Starting server:**

```
//game/backend
  node index.js
```
**Starting client:**

```
//game
  npm start
```

## Available methods

### Connect user

Server receives a request to create a new connection and responds with the following message, which is being sent as stringified JSON.

**Request message:**

```javascript
{
  method: 'connect'
}
```

**Response message:**

```javascript
{
  method: 'connect',
  clientId: <string>
}
```

Field descriptions:

- clientId:
  - generated using UUIDV4 ( https://www.npmjs.com/package/uuid )
  - uniquely identifies a connected client

### Create new game

Server receives a request to create a new game and responds with the following message, which is being sent as stringified JSON.

**Request message:**

```javascript
{
  method: 'create',
  clientId: <string>
}
```

Field descriptions:

- clientId:
  - generated by server using UUIDV4 ( https://www.npmjs.com/package/uuid )
  - uniquely identifies a connected client

**Response:**

```javascript
{
  method: 'create',
  game: <object>
}
```

Field descriptions:

- game:

  - object with the following properties:

    - gameId:

      - string

      - generated using UUIDV4 ( https://www.npmjs.com/package/uuid )
      - uniquely identifies a started game

    - clients:

      - array of strings
      - elements will be ids of both players
      - currently, only element is id of the client from the request message

    - createdAt:

      - instance of class Date

  - object is added to the array on server named *games*

### Join one of the started games

Server receives a request to join one of the started games and responds with one of the following messages to both clients, which is being sent as stringified JSON.

**Request message:**

```javascript
{
  method: 'join',
  clientId: <string>
}
```

Field descriptions:

- clientId:
  - generated by server using UUIDV4 ( https://www.npmjs.com/package/uuid )
  - uniquely identifies a connected client

**Response:**

-If there are no started games, then the response message is:

```javascript
{
  method: 'join',
  gameId: ''
}
```

-If there are no games with one player, then the response message is: 

```javascript
{
  method: 'join',
  gameId: ''
}
```

-If there are started games with one player, server selects the first one and then the response message is:

```javascript
{
  method: 'join',
  gameId: <string>,
  xPlayerId: <string>,
  xIsNextPlayer: true
}
```

Field descriptions:

- gameId:
  - generated using UUIDV4 ( https://www.npmjs.com/package/uuid )
  - uniquely identifies a started game
- xPlayerId:
  - generated using UUIDV4 ( https://www.npmjs.com/package/uuid )
  - uniquely determined player to whom the X character is assigned
- xIsNextPlayer
  - since this is the beginning of the game, player X is first in line to play, so this value is true

### Play the game

Server receives a request to play a player's move and check the status of the game after the move. Server responds with the following message to both clients, which is being sent as stringified JSON.

**Request message:**

```javascript
{
  method: 'play',
  board: <array[string]>,
  gameId: <string>,
  xIsNextPlayer: <boolean>
}
```

Field descriptions:

- board:
  - array of 9 strings
  - elements are values on the board squares and those can be "X" or "O"
- gameId:
  - generated by server using UUIDV4 ( https://www.npmjs.com/package/uuid )
  - uniquely identifies a started game
- xIsNextPlayer:
  - determines which player plays next, X or O

**Response:**

```javascript
{
  method: 'play',
  gameStatus: <string>,
  board: <array[string]>,
  xIsNextPlayer: <boolean>
}
```

Field descriptions:

- gameStatus:
  - the current outcome of the game
  - variable can have one of the following values:
    - "X" - if the player X wins
    - "O" - if the player O wins
    - "undecided" - if no one wins and all the squares on the board are filled
    - "in process" - if no one has won yet and there are empty squares on the board
- board:
  - array of 9 strings
  - elements are values on the board squares and those can be "X" or "O"
- xIsNextPlayer:
  - determines which player plays next, X or O

### Example of server response

```javascript
{
  method: 'play',
  gameStatus: 'X',
  board: ['X','O','X','O','X',null,'X',null,'O'],
  xIsNextPlayer: false
}
```

#### Fields in server response

- method - the name of the request received by the server
- gameStatus - current outcome of the game
- board - current state of the board
- xIsNextPlayer - determines which player plays next, X or O
