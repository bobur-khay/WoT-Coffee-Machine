import { Button, Input, ToggleButtonGroup, Typography } from "@mui/joy";
import { useState } from "react";
import { CellImage } from "./CellImage";
import { Close, PlayArrow, Stop } from "@mui/icons-material";
import { Board, Cell, Coordinates } from "../../../constants";

export const SIDEBAR_WIDTH = 250;

export function Sidebar({
  board,
  setBoard,
  editMode,
  setEditMode,
  hasSimulationStarted,
  setHasSimulationStarted,
  robotPosition,
  setRobotPosition,
}: {
  board: Board;
  setBoard: (map: Board) => void;
  editMode: Cell;
  setEditMode: (mode: Cell) => void;
  hasSimulationStarted: boolean;
  setHasSimulationStarted: (hasStarted: boolean) => void;
  robotPosition: Coordinates | null;
  setRobotPosition: (position: Coordinates | null) => void;
}) {
  const boardSize = board.length;
  const [newSize, setNewSize] = useState(boardSize + "");

  const getNewMap = (newSize: number) => {
    return Array.from({ length: newSize }, (_, i) =>
      Array.from({ length: newSize }, (_, j) => board[i]?.[j] ?? Cell.NONE),
    );
  };

  const clear = () => {
    setRobotPosition(null);
    setBoard(
      Array.from({ length: boardSize }, () =>
        Array.from({ length: boardSize }, () => Cell.NONE),
      ),
    );
  };

  const doesPersonExist = board
    .flatMap((cell) => cell)
    .find((cell) => cell === Cell.TABLE);
  const doesCaffeeMachineExist = board
    .flatMap((cell) => cell)
    .find((cell) => cell === Cell.COFFEE_MACHINE);
  const isReadyForStart =
    robotPosition && doesPersonExist && doesCaffeeMachineExist;

  //TODO: replace with browser-bundle
  const start = async () => {
    setHasSimulationStarted(true);
    const res = await fetch("/api/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ map: board, position: robotPosition }),
    });

    if (!res.ok) {
      alert("An error occured, try again");
    }
  };

  const reset = async () => {
    setHasSimulationStarted(false);
    const res = await fetch("/api/reset", {
      method: "POST",
    });

    if (!res.ok) {
      alert("An error occured, try again");
    }
  };

  return (
    <div
      className="w-72 h-full border-6 border-black/70 flex flex-col p-2 justify-between"
      id="sidebar"
      style={{
        width: SIDEBAR_WIDTH,
      }}
    >
      <div className="flex flex-col gap-4">
        <div>
          <Typography level="h3" textAlign="center" mb={2}>
            Menu
          </Typography>
          <Typography level="title-md">Map Size</Typography>
          <Input
            sx={{ mb: 1 }}
            value={newSize}
            onChange={(e) => {
              setNewSize(e.target.value);
            }}
            disabled={hasSimulationStarted}
          />
          <Button
            variant="soft"
            fullWidth
            onClick={() => {
              setBoard(getNewMap(parseInt(newSize) || 1));
            }}
            disabled={hasSimulationStarted}
          >
            Set
          </Button>
        </div>
        <div>
          <Typography level="title-md">Edit Map</Typography>
          <ToggleButtonGroup
            value={editMode}
            onChange={(_, newValue) => {
              setEditMode(newValue ?? Cell.NONE);
            }}
            sx={{
              width: "100%",
              mb: 1,
            }}
            disabled={hasSimulationStarted}
          >
            <Button
              fullWidth
              sx={{ height: "30px", padding: 0 }}
              value={"robot"}
            >
              <CellImage cellType={Cell.NONE} hasRobot cellSize={30} />
            </Button>
            <Button
              fullWidth
              sx={{ height: "30px", padding: 0 }}
              value={Cell.WALL}
            >
              <CellImage cellType={Cell.WALL} cellSize={30} />
            </Button>
            <Button
              fullWidth
              sx={{ height: "30px", padding: 0 }}
              value={Cell.TABLE}
            >
              <CellImage cellType={Cell.TABLE} cellSize={30} />
            </Button>
            <Button
              fullWidth
              sx={{ height: "30px", padding: 0 }}
              value={Cell.COFFEE_MACHINE}
            >
              <CellImage cellType={Cell.COFFEE_MACHINE} cellSize={30} />
            </Button>
            <Button
              fullWidth
              sx={{ height: "30px", padding: 0 }}
              value={Cell.NONE}
            >
              <CellImage
                cellType={Cell.NONE}
                cellSize={30}
                customIcon={<Close sx={{ fontSize: 30 }} />}
              />
            </Button>
          </ToggleButtonGroup>
          <Button
            variant="soft"
            fullWidth
            onClick={clear}
            disabled={hasSimulationStarted}
          >
            Clear
          </Button>
        </div>
      </div>
      <Button
        disabled={!isReadyForStart}
        onClick={() => {
          hasSimulationStarted ? reset() : start();
        }}
        startDecorator={hasSimulationStarted ? <Stop /> : <PlayArrow />}
        color={hasSimulationStarted ? "warning" : "primary"}
      >
        {hasSimulationStarted ? "Stop" : "Start"}
      </Button>
    </div>
  );
}
