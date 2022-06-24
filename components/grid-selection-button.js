const GridSelectButton = ({ hue, gridSize, clickHandler, ...props }) => {
  return (
    <div
      className="gridSelectButton center"
      style={{
        "--hue": `${hue}`,
      }}
      onClick={() => clickHandler(gridSize)}
    >
      {gridSize} x {gridSize}
    </div>
  );
};

export default GridSelectButton;
