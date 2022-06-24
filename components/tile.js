const Tile = ({ id, flipped, fontSize, content, clickHandler, ...props }) => {
  return (
    <div className="tileWrapper">
      <div
        className={`tile ${flipped ? "isFlipped" : ""}`}
        onClick={() => clickHandler(id)}
      >
        <div
          className="tileFace tileFaceFront center"
          style={{ fontSize: fontSize }}
        ></div>
        <div
          className="tileFace tileFaceBack center"
          style={{ fontSize: fontSize }}
        >
          {content}
        </div>
      </div>
    </div>
  );
};

export default Tile;
