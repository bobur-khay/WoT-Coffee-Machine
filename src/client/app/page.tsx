"use client";
import { useState } from "react";
import { Sidebar } from "./_components/sidebar/Sidebar";
import { OfficeMap } from "./_components/board/OfficeMap";
import {
  Board,
  Cell,
  CoffeeMachineStatus,
  Coordinates,
  EditMode,
  Order,
} from "../../constants";

export const PAGE_GAP = 16;

export default function App() {
  const [board, setBoard] = useState<Board>(initMap);
  const [editMode, setEditMode] = useState<EditMode>(Cell.NONE);
  const [hasSimulationStarted, setHasStarted] = useState(false);
  // The robot position is stored separately because it can be positioned on top of another cell
  // The simulation doesn't start while the position is null
  const [robotPositon, setRobotPosition] = useState<Coordinates | null>([8, 4]);
  // Queue of orders the robot took
  const [robotQueue, setRobotQueue] = useState<Order[]>([]);
  const [coffeeMachineStatus, setCoffeeMachineStatus] =
    useState<CoffeeMachineStatus>({
      progress: 0,
      error: "",
    });

  return (
    <div
      className="flex h-full w-full gap-4 justify-center items-center"
      style={{ gap: PAGE_GAP }}
    >
      <OfficeMap
        board={board}
        editMode={editMode}
        setMap={setBoard}
        hasSimulationStarted={hasSimulationStarted}
        robotPosition={robotPositon}
        setRobotPosition={setRobotPosition}
        setRobotQueue={setRobotQueue}
        robotQueue={robotQueue}
        coffeeMachineStatus={coffeeMachineStatus}
        setCoffeeMachineStatus={setCoffeeMachineStatus}
      />
      <Sidebar
        board={board}
        setBoard={setBoard}
        editMode={editMode}
        setEditMode={setEditMode}
        hasSimulationStarted={hasSimulationStarted}
        setHasSimulationStarted={setHasStarted}
        robotPosition={robotPositon}
        setRobotPosition={setRobotPosition}
        robotQueue={robotQueue}
        coffeeMachineError={coffeeMachineStatus.error}
        setRobotQueue={setRobotQueue}
      />
    </div>
  );
}

const initMap: Board = [
  [
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
  ],
  [
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
  ],
  [
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
  ],
  [
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.WALL,
    Cell.WALL,
    Cell.WALL,
  ],
  [
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.WALL,
    Cell.NONE,
    Cell.WALL,
  ],
  [
    Cell.NONE,
    Cell.NONE,
    Cell.TABLE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.WALL,
    Cell.NONE,
    Cell.WALL,
  ],
  [
    Cell.NONE,
    Cell.NONE,
    Cell.TABLE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
  ],
  [
    Cell.NONE,
    Cell.NONE,
    Cell.TABLE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.COFFEE_MACHINE,
    Cell.NONE,
  ],
  [
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
  ],
  [
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
    Cell.NONE,
  ],
];
