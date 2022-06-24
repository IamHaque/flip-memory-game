import { useEffect, useState } from "react";

import Head from "next/head";
import Tile from "../components/tile";

const allEmojis = [
  "✌",
  "😂",
  "😝",
  "😁",
  "😱",
  "👉",
  "🙌",
  "🍻",
  "🔥",
  "🌈",
  "☀",
  "🎈",
  "🌹",
  "💄",
  "🎀",
  "⚽",
  "🎾",
  "🏁",
  "😡",
  "👿",
  "🐻",
  "🐶",
  "🐬",
  "🐟",
  "🍀",
  "👀",
  "🚗",
  "🍎",
  "💝",
  "💙",
  "👌",
  "❤",
  "😍",
  "😉",
  "😓",
  "😳",
  "💪",
  "💩",
  "🍸",
  "🔑",
  "💖",
  "🌟",
  "🎉",
  "🌺",
  "🎶",
  "👠",
  "🏈",
  "⚾",
  "🏆",
  "👽",
  "💀",
  "🐵",
  "🐮",
  "🐩",
  "🐎",
  "💣",
  "👃",
  "👂",
  "🍓",
  "💘",
  "💜",
  "👊",
  "💋",
  "😘",
  "😜",
  "😵",
  "🙏",
  "👋",
  "🚽",
  "💃",
  "💎",
  "🚀",
  "🌙",
  "🎁",
  "⛄",
  "🌊",
  "⛵",
  "🏀",
  "🎱",
  "💰",
  "👶",
  "👸",
  "🐰",
  "🐷",
  "🐍",
  "🐫",
  "🔫",
  "👄",
  "🚲",
  "🍉",
  "💛",
  "💚",
];

const generateTiles = (content, count) => {
  const generatedTiles = [];
  for (let i = 0; i < count * count; i++) {
    const tile = {
      id: i,
      matched: false,
      flipped: false,
      content: content[i],
    };

    generatedTiles.push(tile);
  }
  return generatedTiles;
};

const generateEmojis = (count) => {
  let emojis = [];
  let emojisGenerated = 0;

  while (emojisGenerated < count) {
    let randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
    if (emojis.includes(randomEmoji)) continue;

    emojis.push(randomEmoji);
    emojis.push(randomEmoji);
    emojisGenerated += 1;
  }

  return shuffleArray(emojis);
};

const shuffleArray = (list) => {
  for (var index = list.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    const tempValue = list[index];
    list[index] = list[randomIndex];
    list[randomIndex] = tempValue;
  }
  return list;
};

const mapRange = (value, low1, high1, low2, high2) =>
  low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);

export default function Home() {
  const [gameState, setGameState] = useState({
    tiles: [],
    newGame: true,
    gameOver: false,
    gridSize: undefined,
    totalAttempts: undefined,
    uniqueTiles: undefined,
    remainingAttempts: undefined,
  });
  const [prevFlippedTileIndex, setPrevFlippedTileIndex] = useState(undefined);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameState.gameOver) return;
    if (gameState.tiles.length <= 0) return;

    let hasWon = true;
    for (let tile of gameState.tiles) {
      if (tile.matched) continue;
      hasWon = false;
      break;
    }
    if (hasWon) setGameState({ ...gameState, gameOver: true });
  }, [gameState]);

  const initializeGame = (gridSize = 2, isNewGame = true) => {
    const uniqueTiles = (gridSize * gridSize) / 2;
    const generatedTiles = initializeTiles(uniqueTiles, gridSize);

    const newGameState = {
      gameOver: false,
      newGame: isNewGame,
      gridSize: gridSize,
      tiles: generatedTiles,
      uniqueTiles: uniqueTiles,
      totalAttempts: Math.ceil(uniqueTiles * 2.5),
      remainingAttempts: Math.ceil(uniqueTiles * 2.5),
    };

    setGameState(newGameState);
    setPrevFlippedTileIndex(-1);
  };

  const initializeTiles = (emojiCount, tileCount) => {
    const emojis = generateEmojis(emojiCount, tileCount);
    return generateTiles(emojis, tileCount);
  };

  const tileClickHandler = (tileID) => {
    if (gameState.tiles[tileID].matched) return;
    if (prevFlippedTileIndex >= 0 && prevFlippedTileIndex === tileID) return;

    let isGameOver = false;
    let remainingAttempts = gameState.remainingAttempts;

    if (prevFlippedTileIndex >= 0) {
      setPrevFlippedTileIndex(-1);

      if (
        prevFlippedTileIndex !== tileID &&
        gameState.tiles[prevFlippedTileIndex].content ===
          gameState.tiles[tileID].content
      ) {
        gameState.tiles[tileID].matched = true;
        gameState.tiles[prevFlippedTileIndex].matched = true;
      } else {
        // Consume attempt if guessed incorrectly
        remainingAttempts -= 1;
        if (remainingAttempts <= 0) {
          isGameOver = true;
        }
      }
    } else {
      setPrevFlippedTileIndex(tileID);
    }

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

  return (
    <div className="container">
      <Head>
        <title>Tile Match</title>
        <meta
          name="description"
          content="Flip memory game to match similar tiles"
        />
      </Head>

      {gameState.gameOver ? (
        <div className="gameOverScreen">
          <header>
            <p>Game Over</p>
          </header>

          <main>
            <p>
              Score: {gameState.remainingAttempts} / {gameState.totalAttempts}
            </p>
          </main>

          <footer>
            <div
              className="button"
              onClick={() => {
                initializeGame();
              }}
            >
              <span>🔄</span>
              <span>Replay</span>
            </div>
          </footer>
        </div>
      ) : (
        <></>
      )}

      <div className="header">
        <p className="title">Tile Match</p>

        <p className="description">
          You have {gameState.remainingAttempts} attempts to match all the
          unmatched tiles.
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
      </div>

      {gameState.newGame ? (
        <div className="gridSelection main">
          <div
            className={`gridSelectButton center ${
              gameState.gridSize === 2 ? "selected" : ""
            }`}
            onClick={() => {
              initializeGame(2, false);
            }}
          >
            2 x 2
          </div>
          <div
            className={`gridSelectButton center ${
              gameState.gridSize === 4 ? "selected" : ""
            }`}
            onClick={() => {
              initializeGame(4, false);
            }}
          >
            4 x 4
          </div>
          <div
            className={`gridSelectButton center ${
              gameState.gridSize === 6 ? "selected" : ""
            }`}
            onClick={() => {
              initializeGame(6, false);
            }}
          >
            6 x 6
          </div>
          <div
            className={`gridSelectButton center ${
              gameState.gridSize === 8 ? "selected" : ""
            }`}
            onClick={() => {
              initializeGame(8, false);
            }}
          >
            8 x 8
          </div>
        </div>
      ) : (
        <div
          className="main"
          style={{
            gap: `${mapRange(gameState.gridSize, 2, 8, 1.5, 0.5)}em`,
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
      )}
    </div>
  );
}
