import { useEffect, useState } from "react";

import Link from "next/link";

import { mapRange, initializeTiles } from "../shared/utils";

import Tile from "../components/tile";
import GridSelectButton from "../components/grid-selection-button";

export default function Game({ username, ...props }) {
  const GRID_SIZES = [2, 4, 6, 8];

  const [gameState, setGameState] = useState({
    tiles: [],
    newGame: true,
    gameWon: false,
    gameOver: false,
    gridSize: undefined,
    highScores: undefined,
    uniqueTiles: undefined,
    totalAttempts: undefined,
    remainingAttempts: undefined,
  });

  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [currentUser, setCurrentUser] = useState(username);
  const [leaderBoard, setLeaderBoard] = useState([]);

  const [prevFlippedTileIndex, setPrevFlippedTileIndex] = useState(undefined);
  const [beingFlipped, setBeingFlipped] = useState(undefined);

  // Initialize game data on page load
  useEffect(() => {
    restartGame();

    let localUsername = JSON.parse(localStorage.getItem("tileMatchUsername"));
    if (localUsername) {
      setCurrentUser(localUsername);
    }
  }, []);

  // Update game state
  useEffect(() => {
    if (gameState.gameOver) {
      // Save high score to local storage
      const currentScore = Math.floor(
        (gameState.remainingAttempts / gameState.totalAttempts) * 100
      );
      if (currentScore > gameState.highScores[gameState.gridSize]) {
        const updatedHighScores = { ...gameState.highScores };
        updatedHighScores[gameState.gridSize] = currentScore;

        localStorage.setItem(
          "tileMatchHighScores",
          JSON.stringify(updatedHighScores)
        );

        setGameState({ ...gameState, highScores: updatedHighScores });

        (async () => {
          await updateDBData(currentScore);
        })();
      }

      (async () => {
        await getLeaderboardData();
      })();

      resetTimer();
      return;
    }

    if (gameState.tiles.length <= 0) return;

    if (gameState.remainingAttempts <= 0) {
      setGameState({ ...gameState, gameOver: true });
      return;
    }

    let hasWon = true;
    for (let tile of gameState.tiles) {
      if (tile.matched) continue;
      hasWon = false;
      break;
    }
    if (hasWon) setGameState({ ...gameState, gameOver: true, gameWon: true });
  }, [gameState]);

  // Decrement remaining attempts every 10 seconds of inactivity
  useEffect(() => {
    if (timer % 10 === 0 && timer > 0) {
      setGameState({
        ...gameState,
        remainingAttempts: gameState.remainingAttempts - 1,
      });
    }
  }, [timer]);

  // Update timer every second
  useEffect(() => {
    let interval = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer((seconds) => seconds + 1);
      }, 1000);
    } else if (!isTimerActive && timer !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timer, isTimerActive]);

  // Initializes the game state
  const initializeGame = async (gridSize = 2, isNewGame = true) => {
    const uniqueTiles = (gridSize * gridSize) / 2;
    const generatedTiles = initializeTiles(uniqueTiles, gridSize);

    let remoteHighScores = await getRemoteHighScores();
    if (remoteHighScores) {
      localStorage.setItem(
        "tileMatchHighScores",
        JSON.stringify(remoteHighScores)
      );
    }

    let localHighScores = JSON.parse(
      localStorage.getItem("tileMatchHighScores")
    );

    const highScores = remoteHighScores
      ? remoteHighScores
      : localHighScores
      ? localHighScores
      : {
          2: 0,
          4: 0,
          6: 0,
          8: 0,
        };

    const newGameState = {
      gameWon: false,
      gameOver: false,
      gridSize: gridSize,
      newGame: isNewGame,
      highScores: highScores,
      tiles: generatedTiles,
      uniqueTiles: uniqueTiles,
      totalAttempts: Math.floor(uniqueTiles * 2.25),
      remainingAttempts: Math.floor(uniqueTiles * 2.25),
    };

    setBeingFlipped(false);
    setGameState(newGameState);
    setPrevFlippedTileIndex(-1);
  };

  // Reset game state
  const restartGame = () => {
    initializeGame();
  };

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const restartTimer = () => {
    setTimer(0);
  };

  const resetTimer = () => {
    setTimer(0);
    setIsTimerActive(false);
  };

  const tileClickHandler = (tileID) => {
    // Return if already being flipped
    if (beingFlipped) return;

    // Return if clicked on already matched tile
    if (gameState.tiles[tileID].matched) return;

    // Return if clicked on last flipped tile
    if (prevFlippedTileIndex >= 0 && prevFlippedTileIndex === tileID) return;

    setBeingFlipped(true);

    let isGameOver = false;
    let remainingAttempts = gameState.remainingAttempts;

    if (prevFlippedTileIndex >= 0) {
      // Checks if last flipped tile and current tile match
      if (
        gameState.tiles[prevFlippedTileIndex].content ===
        gameState.tiles[tileID].content
      ) {
        setBeingFlipped(false);
        gameState.tiles[tileID].matched = true;
        gameState.tiles[prevFlippedTileIndex].matched = true;
      } else {
        // Decrement attempt if guessed incorrectly
        remainingAttempts -= 1;

        // Game is over if all attempts are used
        if (remainingAttempts <= 0) {
          isGameOver = true;
        }

        unFlipFlippedTiles(isGameOver, remainingAttempts);
        restartTimer();
      }

      setPrevFlippedTileIndex(-1);
    } else {
      setBeingFlipped(false);
      setPrevFlippedTileIndex(tileID);
    }

    // Flip tiles
    const flippedTiles = gameState.tiles.map((tile) => {
      return {
        ...tile,
        flipped: tile.matched
          ? true
          : tile.id === tileID ||
            (prevFlippedTileIndex >= 0 && tile.id === prevFlippedTileIndex)
          ? true
          : false,
      };
    });

    setGameState({
      ...gameState,
      gameOver: isGameOver,
      tiles: [...flippedTiles],
      remainingAttempts: remainingAttempts,
    });
  };

  const unFlipFlippedTiles = (gameOver, remainingAttempts) => {
    setTimeout(() => {
      const flippedTiles = gameState.tiles.map((tile) => {
        return {
          ...tile,
          flipped: tile.matched,
        };
      });
      setGameState({
        ...gameState,
        gameOver,
        remainingAttempts,
        tiles: [...flippedTiles],
      });
      setBeingFlipped(false);
    }, 1000);
  };

  const gridSelectionButtonClickHandler = async (selectedGridSize) => {
    initializeGame(selectedGridSize, false);
    toggleTimer();
  };

  const updateDBData = async (score) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score,
        username: currentUser,
        gridSize: gameState.gridSize,
      }),
    };

    await fetch("/api/updateScores", requestOptions);
  };

  const getRemoteHighScores = async () => {
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };

    const response = await fetch("/api/user/" + currentUser);
    const data = await response.json();
    return data.scores;
  };

  const getLeaderboardData = async () => {
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };

    const response = await fetch("/api/leaderboard/" + gameState.gridSize);
    const data = await response.json();

    if (data && data.leaderboard) {
      setLeaderBoard(data.leaderboard);
    }
  };

  let LeaderBoard;
  if (leaderBoard && leaderBoard.length > 0) {
    LeaderBoard = (
      <>
        <p className="titleText">Leader Board</p>

        <section className="leaderboardContainer">
          {leaderBoard.map((user, index) => (
            <p
              className={`row ${user.username === currentUser ? "active" : ""}`}
              key={index}
            >
              <span>{index + 1}.</span>
              <span>{user.username}</span>
              <span>{user.score}</span>
            </p>
          ))}
          {leaderBoard.length < 5 ? (
            new Array(5 - leaderBoard.length).fill(0).map((_, index) => (
              <p className="row" key={index + "randomSalt01"}>
                <span>-</span>
                <span>-</span>
                <span>-</span>
              </p>
            ))
          ) : (
            <></>
          )}
        </section>
      </>
    );
  }

  // Show game-over overlay if game is over
  let GameEndOverlay = <></>;
  if (gameState.gameWon || gameState.gameOver) {
    GameEndOverlay = (
      <div className="gameOverScreen center">
        <div className="top">
          <header>
            <p>{gameState.gameWon ? "You Won!!" : "You lose!!"}</p>
          </header>

          <main>
            <p className="score">
              <span>Score</span>
              <span>
                {Math.floor(
                  (gameState.remainingAttempts / gameState.totalAttempts) * 100
                )}
                %
              </span>
            </p>
            <p className="score highScore">
              <span>High Score</span>
              <span>{gameState.highScores[gameState.gridSize]}%</span>
            </p>
          </main>

          <footer>
            <div
              className="restartGameButton"
              onClick={() => {
                restartGame();
              }}
            >
              <span>Restart</span>
            </div>
          </footer>
        </div>

        <div className="bottom">{LeaderBoard}</div>
      </div>
    );
  }

  // Set game header based on new game or running game
  let GameHeaderContent;
  if (gameState.newGame) {
    GameHeaderContent = (
      <p className="description">
        Select a grid layout from the below options.
        <br />
        Each option scales exponentially in difficulty.
      </p>
    );
  } else {
    GameHeaderContent = (
      <>
        <p className="description">
          You have{" "}
          <span className="strong">{gameState.totalAttempts} attempts</span> to
          match all the unmatched tiles. An attempt will be removed every{" "}
          <span className="strong">10 seconds</span>.
        </p>

        <div className="progressContainer">
          <div className="progressContainerTop">
            <p className="progressTitle">Attempts remaining</p>
            <p className="progressStatus">
              {gameState.remainingAttempts} / {gameState.totalAttempts}
            </p>
          </div>

          <div
            className="progressContainerBottom"
            style={{
              "--progressBarRight": `${
                (gameState.remainingAttempts / gameState.totalAttempts) * 100
              }%`,
            }}
          ></div>
        </div>
      </>
    );
  }

  // Set game main content based on new game or running game
  let GameMainContent;
  if (gameState.newGame) {
    GameMainContent = (
      <>
        <div className="gridSelection main">
          {GRID_SIZES.map((item, index) => (
            <GridSelectButton
              key={index}
              gridSize={item}
              hue={mapRange(index, 0, 3, 260, 360) * -1}
              clickHandler={gridSelectionButtonClickHandler}
            />
          ))}
        </div>
        <div className="bottomButton">
          <Link href="/">Back to Main Menu</Link>
        </div>
      </>
    );
  } else {
    GameMainContent = (
      <>
        <div
          className="main"
          style={{
            gap: `${mapRange(gameState.gridSize, 2, 8, 1.5, 0.3)}em`,
            gridTemplateRows: `repeat(${gameState.gridSize}, 1fr)`,
            gridTemplateColumns: `repeat(${gameState.gridSize}, 1fr)`,
          }}
        >
          {gameState.tiles.map((tile) => (
            <Tile
              id={tile.id}
              key={tile.id}
              content={tile.content}
              flipped={tile.flipped}
              clickHandler={tileClickHandler}
              fontSize={`${mapRange(gameState.gridSize, 2, 8, 3, 1.5)}rem`}
            />
          ))}
        </div>
        <div
          className="bottomButton"
          onClick={() => {
            restartGame();
          }}
        >
          <span>Restart Game</span>
        </div>
      </>
    );
  }

  return (
    <div className="container">
      {GameEndOverlay}

      <div className="header">
        <p className="title">Tile Match</p>
        {GameHeaderContent}
      </div>

      {GameMainContent}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { username } = context.query;
  return {
    props: {
      username: username,
    },
  };
}
