const GridSelectButton = ({
  hue,
  isBusy,
  gridSize,
  clickHandler,
  ...props
}) => {
  return (
    <div
      className="gridSelectButton center"
      style={{
        "--hue": `${hue}`,
      }}
      onClick={() => clickHandler(gridSize)}
    >
      {isBusy ? "..." : `${gridSize} x ${gridSize}`}
    </div>
  );
};

export default GridSelectButton;
