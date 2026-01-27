import { MapType } from "@/app/page";
import { Button, Input, ToggleButtonGroup, Typography } from "@mui/joy";
import { useState } from "react";
import { CellImage } from "./CellImage";
import { PlayArrow, Stop } from "@mui/icons-material";
import { CellType } from "../../../constants";

export const SIDEBAR_WIDTH = 250;

export function Sidebar({
  map,
  setMap,
  editMode,
  setEditMode,
  hasStarted,
  setHasStarted,
  robotPosition,
}: {
  map: MapType;
  setMap: (map: MapType) => void;
  editMode: CellType;
  setEditMode: (mode: CellType) => void;
  hasStarted: boolean;
  setHasStarted: (hasStarted: boolean) => void;
  robotPosition: number[] | null;
}) {
  const mapSize = map.length;
  const [newSize, setNewSize] = useState(mapSize + "");

  const getNewMap = (newSize: number) => {
    return Array.from({ length: newSize }, (_, i) =>
      Array.from({ length: newSize }, (_, j) => map[i]?.[j] ?? CellType.NONE),
    );
  };

  const clear = () => {
    setMap(
      Array.from({ length: mapSize }, () =>
        Array.from({ length: mapSize }, () => CellType.NONE),
      ),
    );
  };

  const doesPersonExist = map
    .flatMap((cell) => cell)
    .find((cell) => cell === CellType.TABLE);
  const doesCaffeeMachineExist = map
    .flatMap((cell) => cell)
    .find((cell) => cell === CellType.COFFEE_MACHINE);
  const isReadyForStart =
    robotPosition && doesPersonExist && doesCaffeeMachineExist;

  const start = async () => {
    setHasStarted(true);
    const res = await fetch("/api/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ map, position: robotPosition }),
    });

    if (!res.ok) {
      alert("An error occured, try again");
    }
  };

  const reset = async () => {
    setHasStarted(false);
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
            disabled={hasStarted}
          />
          <Button
            variant="soft"
            fullWidth
            onClick={() => {
              setMap(getNewMap(parseInt(newSize) || 1));
            }}
            disabled={hasStarted}
          >
            Set
          </Button>
        </div>
        <div>
          <Typography level="title-md">Edit Map</Typography>
          <ToggleButtonGroup
            value={editMode}
            onChange={(_, newValue) => {
              setEditMode(newValue ?? CellType.NONE);
            }}
            sx={{
              width: "100%",
              mb: 1,
            }}
            disabled={hasStarted}
          >
            <Button
              fullWidth
              sx={{ height: "30px", padding: 0 }}
              value={CellType.ROBOT}
            >
              <CellImage cellType={CellType.ROBOT} isRobot cellSize={30} />
            </Button>
            <Button
              fullWidth
              sx={{ height: "30px", padding: 0 }}
              value={CellType.WALL}
            >
              <CellImage cellType={CellType.WALL} cellSize={30} />
            </Button>
            <Button
              fullWidth
              sx={{ height: "30px", padding: 0 }}
              value={CellType.TABLE}
            >
              <CellImage cellType={CellType.TABLE} cellSize={30} />
            </Button>
            <Button
              fullWidth
              sx={{ height: "30px", padding: 0 }}
              value={CellType.COFFEE_MACHINE}
            >
              <CellImage
                cellType={CellType.COFFEE_MACHINE}
                cellSize={30}
                isEmptyCross
              />
            </Button>
            <Button
              fullWidth
              sx={{ height: "30px", padding: 0 }}
              value={CellType.NONE}
            >
              <CellImage cellType={CellType.NONE} cellSize={30} isEmptyCross />
            </Button>
          </ToggleButtonGroup>
          <Button
            variant="soft"
            fullWidth
            onClick={clear}
            disabled={hasStarted}
          >
            Clear
          </Button>
        </div>
      </div>
      <Button
        disabled={!isReadyForStart}
        onClick={() => {
          hasStarted ? reset() : start();
        }}
        startDecorator={hasStarted ? <Stop /> : <PlayArrow />}
        color={hasStarted ? "warning" : "primary"}
      >
        {hasStarted ? "Stop" : "Start"}
      </Button>
    </div>
  );
}
