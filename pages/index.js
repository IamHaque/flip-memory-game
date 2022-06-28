import { useEffect, useState } from "react";

import Link from "next/link";

import styles from "../styles/home.module.scss";

export default function Home() {
  const [username, setUsername] = useState("");
  const [userExists, setUserExists] = useState(false);
  const [response, setResponse] = useState(undefined);

  useEffect(() => {
    let localUsername = localStorage.getItem("tileMatchUsername");
    localUsername = JSON.parse(localUsername);

    if (localUsername) {
      setUserExists(true);
      setUsername(localUsername);
    }
  }, []);

  const registerUser = async () => {
    const requestOptions = {
      method: "POST",
      body: JSON.stringify({ username }),
      headers: { "Content-Type": "application/json" },
    };

    const response = await fetch("/api/addNewUser", requestOptions);
    const data = await response.json();

    setResponse(data);

    if (data.status && data.status === "success") {
      localStorage.setItem("tileMatchUsername", JSON.stringify(username));
      setUserExists(true);
    }
  };

  const usernameChangeHandler = () => {
    setUsername("");
    setUserExists(false);
    setResponse(undefined);
    localStorage.setItem("tileMatchUsername", JSON.stringify(""));
  };

  let MainContent;
  if (
    userExists ||
    (response && response.status && response.status === "success")
  ) {
    MainContent = (
      <div className={styles.greetUser}>
        <p>
          Welcome{" "}
          <span className={styles.username}>
            {username === "" ? "Anon" : username}
          </span>
        </p>
        <p className={styles.small}>
          be prepared to get your memory retention skills tested...
        </p>
      </div>
    );
  } else {
    MainContent = (
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <label htmlFor="username">Enter username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div
          className={styles.button}
          onClick={() => {
            registerUser();
          }}
        >
          Check Availability
        </div>
        <small className={styles.error}>
          {response && response.status && response.status === "failed"
            ? response.message
            : ""}
        </small>
      </div>
    );
  }

  let ChangeUsernameButton;
  if (userExists) {
    ChangeUsernameButton = (
      <div
        className={`${styles.changeUsername}`}
        onClick={() => {
          usernameChangeHandler();
        }}
      >
        Change Username
      </div>
    );
  }

  return (
    <div className="container">
      <header className={`${styles.header} center`}>
        <p className="title">Tile Match</p>
      </header>

      <main className={`${styles.main} center`}>
        {MainContent}

        <div className={styles.bottomButtons}>
          <div
            className={`${styles.startGameButton} ${
              userExists ? "" : "disabled"
            }`}
          >
            <Link
              href={{
                pathname: "/game",
                query: { username: username },
              }}
            >
              Start Game
            </Link>
          </div>

          {ChangeUsernameButton}
        </div>
      </main>
    </div>
  );
}
