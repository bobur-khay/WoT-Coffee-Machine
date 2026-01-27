"use client";
import { useState } from "react";
import { Sidebar } from "./_components/Sidebar";
import { OfficeMap } from "./_components/OfficeMap";
import { CellType } from "../../constants";

export const PAGE_GAP = 16;

export type MapType = CellType[][];

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [map, setMap] = useState<MapType>(initMap as MapType);
  const [editMode, setEditMode] = useState<CellType>(CellType.NONE);
  const [robotPositon, setRobotPosition] = useState<number[] | null>([8, 4]);

  return (
    <div
      className="flex h-full w-full gap-4 justify-center items-center"
      style={{ gap: PAGE_GAP }}
    >
      <OfficeMap
        map={map}
        editMode={editMode}
        setMap={setMap}
        hasStarted={hasStarted}
        robotPosition={robotPositon}
        setRobotPosition={setRobotPosition}
      />
      <Sidebar
        map={map}
        setMap={setMap}
        editMode={editMode}
        setEditMode={setEditMode}
        hasStarted={hasStarted}
        setHasStarted={setHasStarted}
        robotPosition={robotPositon}
      />
    </div>
  );
}

const initMap = [
  [
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ],
  [
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ],
  [
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ],
  [
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "wall",
    "wall",
    "wall",
  ],
  [
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "wall",
    "none",
    "wall",
  ],
  [
    "none",
    "none",
    "table",
    "none",
    "none",
    "none",
    "none",
    "wall",
    "none",
    "wall",
  ],
  [
    "none",
    "none",
    "table",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ],
  [
    "none",
    "none",
    "table",
    "none",
    "none",
    "none",
    "none",
    "none",
    "caffe_machine",
    "none",
  ],
  [
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ],
  [
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ],
];
