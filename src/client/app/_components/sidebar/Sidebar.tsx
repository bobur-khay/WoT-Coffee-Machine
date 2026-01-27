import { Button, Typography } from "@mui/joy";
import { PlayArrow, Stop } from "@mui/icons-material";
import {
  Board,
  Cell,
  Coordinates,
  EditMode,
  Order,
} from "../../../../constants";
import { SidebarMenu } from "./SidebarMenu";
import { Orders } from "./Orders";
import { Dispatch, SetStateAction } from "react";

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
  robotQueue,
  setRobotQueue,
  coffeeMachineError,
}: {
  board: Board;
  setBoard: (map: Board) => void;
  editMode: EditMode;
  setEditMode: (mode: EditMode) => void;
  hasSimulationStarted: boolean;
  setHasSimulationStarted: (hasStarted: boolean) => void;
  robotPosition: Coordinates | null;
  setRobotPosition: (position: Coordinates | null) => void;
  robotQueue: Order[];
  setRobotQueue: Dispatch<SetStateAction<Order[]>>;
  coffeeMachineError: string;
}) {
  const doesPersonExist = board
    .flatMap((cell) => cell)
    .find((cell) => cell === Cell.TABLE);
  const doesCaffeeMachineExist = board
    .flatMap((cell) => cell)
    .find((cell) => cell === Cell.COFFEE_MACHINE);
  const isReadyForStart =
    robotPosition && doesPersonExist && doesCaffeeMachineExist;

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
    setRobotQueue([]);
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
      <div className="flex flex-col overflow-y-auto">
        <Typography level="h3" textAlign="center" mb={3}>
          {hasSimulationStarted ? "Orders" : "Menu"}
        </Typography>
        {hasSimulationStarted ? (
          <Orders
            robotQueue={robotQueue}
            coffeeMachineError={coffeeMachineError}
          />
        ) : (
          <SidebarMenu
            board={board}
            editMode={editMode}
            hasSimulationStarted={hasSimulationStarted}
            setBoard={setBoard}
            setEditMode={setEditMode}
            setRobotPosition={setRobotPosition}
          />
        )}
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
