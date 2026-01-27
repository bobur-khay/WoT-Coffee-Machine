import { Close } from "@mui/icons-material";
import { Typography, Input, Button, ToggleButtonGroup } from "@mui/joy";
import { Cell, Board, EditMode, Coordinates } from "../../../../constants";
import { CellImage } from "../board/CellImage";
import { useState } from "react";

export function SidebarMenu({
  board,
  setBoard,
  editMode,
  setEditMode,
  hasSimulationStarted,
  setRobotPosition,
}: {
  board: Board;
  setBoard: (newBoared: Board) => void;
  editMode: EditMode;
  setEditMode: (newEditMode: EditMode) => void;
  hasSimulationStarted: boolean;
  setRobotPosition: (newPosition: Coordinates | null) => void;
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
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
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
      <div className="flex flex-col gap-1.5">
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
          <Button fullWidth sx={{ height: "30px", padding: 0 }} value={"robot"}>
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
  );
}
