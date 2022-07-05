import { useState, useEffect } from "react";

import Link from "next/link";

import { mapRange } from "../shared/utils";

import GridSelectButton from "../components/grid-selection-button";

export default function Game({ username, ...props }) {
  const GRID_SIZES = [2, 4, 6, 8];

  const [isBusy, setIsBusy] = useState(false);
  const [gridSize, setGridSize] = useState(undefined);
  const [onMainScreen, setOnMainScreen] = useState(true);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [leaderboardData, setLeaderBoardData] = useState([]);

  // Initialize game data on page load
  useEffect(() => {
    let localUsername = JSON.parse(localStorage.getItem("tileMatchUsername"));
    if (localUsername) {
      setCurrentUser(localUsername);
    }
  }, []);

  const resetState = () => {
    setIsBusy(false);
    setOnMainScreen(true);
    setGridSize(undefined);
    setLeaderBoardData([]);
  };

  const gridSelectionButtonClickHandler = async (selectedGridSize) => {
    if (isBusy) return;

    setIsBusy(true);

    await getLeaderboardData(selectedGridSize);
    setGridSize(selectedGridSize);
    setOnMainScreen(false);

    setIsBusy(false);
  };

  const getLeaderboardData = async (selectedGridSize) => {
    if (!selectedGridSize || !GRID_SIZES.includes(selectedGridSize)) return;

    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };

    const response = await fetch(
      "/api/leaderboard/" + selectedGridSize,
      requestOptions
    );
    const data = await response.json();

    if (data && data.leaderboard) {
      setLeaderBoardData(data.leaderboard);
    }
  };

  let LeaderBoard;
  if (leaderboardData && leaderboardData.length >= 0) {
    LeaderBoard = (
      <section className="leaderboardContainer">
        {leaderboardData.map((user, index) => (
          <p
            className={`row ${user.username === currentUser ? "active" : ""}`}
            key={index}
          >
            <span>{index + 1}.</span>
            <span>{user.username}</span>
            <span>{user.score}</span>
          </p>
        ))}

        {leaderboardData.length < 10 ? (
          new Array(10 - leaderboardData.length).fill(0).map((_, index) => (
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
    );
  }

  let GameHeaderContent = (
    <>
      <p className="title">Tile Match</p>
      <p className="description">
        {onMainScreen
          ? "Select the grid size to show its leaderboard."
          : `Leaderboard of ${gridSize}x${gridSize} game mode.`}
      </p>
    </>
  );

  let GameMainContent;
  if (onMainScreen) {
    GameMainContent = (
      <>
        <div className="gridSelection main">
          {GRID_SIZES.map((item, index) => (
            <GridSelectButton
              key={index}
              isBusy={isBusy}
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
        <div className="main leaderboardMain">
          <p className="titleText center">Leader Board</p>

          {LeaderBoard}
        </div>

        <div className="bottomButton" onClick={resetState}>
          <span>Back to Grid Selection Screen</span>
        </div>
      </>
    );
  }

  return (
    <div className="container">
      <div className="header">{GameHeaderContent}</div>
      {GameMainContent}
    </div>
  );
}
