import { useEffect, useState } from "react";

import Link from "next/link";

import styles from "../styles/home.module.scss";

export default function Home() {
  const [username, setUsername] = useState("");
  const [showModal, setShowModal] = useState(false);
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
    closeModal();
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
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
            onChange={(e) => setUsername(e.target.value.trim())}
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

        {response && response.status && response.status === "failed" ? (
          <small
            className={styles.error}
            dangerouslySetInnerHTML={{ __html: response.message }}
          ></small>
        ) : (
          ""
        )}
      </div>
    );
  }

  let ChangeUsernameButton;
  if (userExists) {
    ChangeUsernameButton = (
      <div
        className={`${styles.changeUsername}`}
        onClick={() => {
          openModal();
        }}
      >
        Change Username
      </div>
    );
  }

  let Modal = (
    <div
      className={styles.modalContainer}
      style={{
        opacity: !showModal ? "0" : "1",
        left: showModal ? "0" : "-200vw",
        visibility: !showModal ? "hidden" : "visible",
      }}
    >
      <div className={styles.modal}>
        <p className={styles.modal__Title}>Change username?</p>
        <p
          className={styles.modal__Description}
          style={{
            opacity: !showModal ? "0" : "1",
            transition: "opacity 200ms ease-out 300ms",
          }}
        >
          If you choose to change your username, you cannot get the current
          username back.
          <br />
          Current scores will be displayed on the leaderboard but it cannot be
          updated.
        </p>
        <div className={styles.modal__Buttons}>
          <div
            className={styles.modal__Cancel}
            onClick={() => {
              closeModal();
            }}
          >
            No
          </div>
          <div
            className={styles.modal__Confirm}
            onClick={() => {
              usernameChangeHandler();
            }}
          >
            Yes
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      {Modal}

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
              {userExists ? "Start Game" : "Select Username Above"}
            </Link>
          </div>

          {ChangeUsernameButton}
        </div>
      </main>
    </div>
  );
}
