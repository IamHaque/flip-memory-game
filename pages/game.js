import { useEffect, useState } from "react";

import Link from "next/link";

import { mapRange, initializeTiles, showElapsedTime } from "../shared/utils";

import Tile from "../components/tile";
import GridSelectButton from "../components/grid-selection-button";

export default function Game({ username, ...props }) {
  const GRID_SIZES = [2, 4, 6, 8];

  const [gameState, setGameState] = useState({
    tiles: [],
    newGame: true,
    gameOver: false,
    attempts: undefined,
    gridSize: undefined,
    highScores: undefined,
    uniqueTiles: undefined,
    matchedTiles: undefined,
  });

  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [score, setScore] = useState(0);
  const [leaderBoard, setLeaderBoard] = useState([]);
  const [currentUser, setCurrentUser] = useState(username);

  const [prevFlippedTileIndex, setPrevFlippedTileIndex] = useState(undefined);
  const [beingFlipped, setBeingFlipped] = useState(undefined);

  // Initialize game data on page load
  useEffect(() => {
    restartGame();

    let localUsername = JSON.parse(localStorage.getItem("tileMatchUsername"));
    if (localUsername) {
      setCurrentUser(localUsername);
    }

    const vh = window.innerHeight - 1;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
    window.addEventListener("resize", () => {
      const vh = window.innerHeight - 1;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    });
  }, []);

  // Update game state
  useEffect(() => {
    if (gameState.gameOver) {
      handleGameOver();
      return;
    }

    if (gameState.tiles.length <= 0) return;

    let hasWon = true;
    for (let tile of gameState.tiles) {
      if (tile.matched) continue;
      hasWon = false;
      break;
    }
    if (hasWon) setGameState({ ...gameState, gameOver: true });
  }, [gameState]);

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
      attempts: 0,
      gameOver: false,
      matchedTiles: 0,
      gridSize: gridSize,
      newGame: isNewGame,
      tiles: generatedTiles,
      highScores: highScores,
      uniqueTiles: uniqueTiles,
    };

    // Reset timer
    setTimer(0);
    setIsTimerActive(true);

    setBeingFlipped(false);
    setGameState(newGameState);
    setPrevFlippedTileIndex(-1);
  };

  const getScore = () => {
    const minimumMoves = gameState.uniqueTiles;
    const minimumTime = gameState.uniqueTiles * 0.3;
    const highestScorePossible = gameState.gridSize * 500;

    const timeTaken = timer <= 0 ? 1 : timer;
    const attemptsTaken = gameState.attempts <= 0 ? 0 : gameState.attempts;

    const currentScore = Math.floor(
      (minimumTime / timeTaken) *
        (minimumMoves / attemptsTaken) *
        highestScorePossible
    );

    return currentScore;
  };

  // Reset game state
  const restartGame = () => {
    initializeGame();
  };

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
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
    let attempts = gameState.attempts;
    let state = { ...gameState };

    if (prevFlippedTileIndex >= 0) {
      // Increment attempt when valid tile is clicked
      attempts += 1;

      // Checks if last flipped tile and current tile match
      if (
        state.tiles[prevFlippedTileIndex].content ===
        state.tiles[tileID].content
      ) {
        setBeingFlipped(false);
        state.matchedTiles += 1;
        state.tiles[tileID].matched = true;
        state.tiles[prevFlippedTileIndex].matched = true;

        vibrate();
      } else {
        unFlipFlippedTiles(isGameOver, attempts);
      }

      setPrevFlippedTileIndex(-1);
    } else {
      setBeingFlipped(false);
      setPrevFlippedTileIndex(tileID);
    }

    // Flip tiles
    const flippedTiles = state.tiles.map((tile) => {
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
      attempts: attempts,
      gameOver: isGameOver,
      tiles: [...flippedTiles],
      matchedTiles: state.matchedTiles,
    });
  };

  const unFlipFlippedTiles = (gameOver, attempts) => {
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
        attempts,
        tiles: [...flippedTiles],
      });
      setBeingFlipped(false);
    }, 800);
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

  const handleGameOver = async () => {
    const currentScore = getScore();
    setScore(currentScore);

    // Save high score to local storage
    if (currentScore > gameState.highScores[gameState.gridSize]) {
      const updatedHighScores = { ...gameState.highScores };
      updatedHighScores[gameState.gridSize] = currentScore;

      localStorage.setItem(
        "tileMatchHighScores",
        JSON.stringify(updatedHighScores)
      );

      await updateDBData(currentScore);
      setGameState({ ...gameState, highScores: updatedHighScores });
    }

    await getLeaderboardData();
    toggleTimer();
  };

  const vibrate = () => {
    if (!window) {
      return;
    }

    if (!window.navigator) {
      return;
    }

    if (!window.navigator.vibrate) {
      return;
    }

    window.navigator.vibrate([200]);
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
              <span>{user.rank}.</span>
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
  if (gameState.gameOver) {
    GameEndOverlay = (
      <div className="gameOverScreen center">
        <div className="top">
          <header>
            <p>Level Complete!</p>
          </header>

          <main>
            <p className="score">
              <span>Score</span>
              <span>{score}</span>
            </p>
            <p className="score highScore">
              <span>High Score</span>
              <span>{gameState.highScores[gameState.gridSize]}</span>
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
      <>
        <p className="title">Tile Match</p>
        <p className="description">
          Select a grid layout from the below options.
          <br />
          Each option scales exponentially in difficulty.
        </p>
      </>
    );
  } else {
    GameHeaderContent = (
      <>
        <p className="description">
          <span className="strong">Tap</span> or{" "}
          <span className="strong">Click</span> on a tile to flip it.
          <br />
          Match all the <span className="strong">tile pairs</span> to complete
          the game.
        </p>

        <div className="progressContainer">
          <div className="progressContainerTop">
            <p className="progressTitle">Time Elapsed</p>
            <p className="progressStatus">{showElapsedTime(timer)}</p>
          </div>

          <div className="progressContainerTop">
            <p className="progressTitle">Matched Tiles</p>
            <p className="progressStatus">
              {gameState.matchedTiles} / {gameState.uniqueTiles}
            </p>
          </div>
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
              hue={mapRange(index, 0, 3, 180, 360) * -1}
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

      <div className="header">{GameHeaderContent}</div>

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
