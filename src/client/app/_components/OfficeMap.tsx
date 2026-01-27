"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { PAGE_PADDING } from "@/app/layout";
import { CellImage } from "./CellImage";
import { tm } from "@/utils";
import {
  Button,
  Modal,
  ModalClose,
  ModalDialog,
  ToggleButtonGroup,
  Typography,
} from "@mui/joy";

import {
  Strength,
  CoffeeType,
  Cell,
  Order,
  Coordinates,
  Board,
  EditMode,
  robotTdUrl,
} from "../../../constants";

//@ts-expect-error not typed
import { Core, Http } from "@node-wot/browser-bundle";

export function OfficeMap({
  board,
  setMap,
  editMode,
  hasSimulationStarted,
  robotPosition,
  setRobotPosition,
}: {
  board: Board;
  setMap: Dispatch<SetStateAction<Board>>;
  editMode: EditMode;
  hasSimulationStarted: boolean;
  robotPosition: Coordinates | null;
  setRobotPosition: (pos: Coordinates | null) => void;
}) {
  // The height/width of the board in cells count
  const boardSize = board.length;
  const [boardSizePx, setMapSizePx] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [coffeeMachineState, setCoffeeMachineState] = useState({
    progress: 0,
    error: "",
  });

  const hasSimulationStartedRef = useRef(hasSimulationStarted);

  const cellSize = (boardSizePx - 2) / boardSize;
  // Configure the pixel size of the board for responsiveness
  const configMap = () => {
    const sidebar = document.getElementById("sidebar");
    const sidebarWidth = sidebar?.offsetWidth ?? 0;
    const screenWidth = document.body.clientWidth - 2 * PAGE_PADDING;
    const sidebarHeight = sidebar?.offsetHeight ?? 0;
    const boardMaxWidth = screenWidth - sidebarWidth - 16;
    let boardSizePx = 0;
    if (boardMaxWidth < sidebarHeight) {
      boardSizePx = boardMaxWidth;
    } else {
      boardSizePx = sidebarHeight;
    }
    setMapSizePx(boardSizePx);
  };

  useEffect(() => {
    // Responsive Design
    configMap();
    window.addEventListener("resize", configMap);
    // Drag and Draw
    window.addEventListener("mousedown", () => {
      setIsMouseDown(true);
    });
    window.addEventListener("mouseup", () => {
      setIsMouseDown(false);
    });
    //Clean up
    return () => {
      window.removeEventListener("resize", configMap);
      window.removeEventListener("mousedown", () => {
        setIsMouseDown(true);
      });
      window.removeEventListener("mouseup", () => {
        setIsMouseDown(false);
      });
    };
  }, []);

  useEffect(() => {
    if (!hasSimulationStarted) {
      setCoffeeMachineState({
        progress: 0,
        error: "",
      });
    }
    hasSimulationStartedRef.current = hasSimulationStarted;
    (async () => {
      const servient = new Core.Servient();
      servient.addClientFactory(new Http.HttpClientFactory());
      const WoT = await servient.start();
      const robotTd = await WoT.requestThingDescription(robotTdUrl);
      const robot = await WoT.consume(robotTd);

      robot.observeProperty("position", async (position: any) => {
        position && setRobotPosition(await position.value());
      });

      while (hasSimulationStartedRef.current) {
        const coffeeRes = await fetch("api/status/coffee", {
          cache: "no-store",
        });
        const status = await coffeeRes.json();
        console.log("coffee status", status);
        setCoffeeMachineState(status);
        await new Promise((r) => setTimeout(r, 200));
      }
    })();
  }, [hasSimulationStarted]);

  const setCell = (x: number, y: number) => {
    if (editMode === "robot") {
      setRobotPosition([x, y]);
    } else if (
      editMode === Cell.NONE &&
      x === robotPosition?.[0] &&
      y === robotPosition[1]
    ) {
      setRobotPosition(null);
    } else {
      setMap((prev) => {
        let prevMap = [...prev];
        // There can be one coffee machine at a time
        if (editMode === Cell.COFFEE_MACHINE) {
          prevMap = prevMap.map((row) =>
            row.map((cell) =>
              cell === Cell.COFFEE_MACHINE ? Cell.NONE : cell,
            ),
          );
        }
        prevMap[y][x] = editMode;
        return prevMap;
      });
    }
  };

  // TODO: replace with browser-bundle
  const order = async () => {
    setCurrentOrder(null);
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentOrder),
    });
    if (!res.ok) {
      alert("An error occured, pls refresh and try again");
    }
  };

  return (
    <div
      className="gap-0 flex flex-wrap border border-gray-600 content-start select-none"
      style={{
        width: boardSizePx,
        height: boardSizePx,
      }}
    >
      {currentOrder && (
        <Modal open onClose={() => setCurrentOrder(null)}>
          <ModalDialog>
            <ModalClose />
            <Typography level="title-lg">
              Table Order:
              {`(${currentOrder?.tableNr[0]}, ${currentOrder?.tableNr[1]})`}
            </Typography>
            <Typography level="title-md">Caffee Type</Typography>
            <ToggleButtonGroup
              value={currentOrder.coffeeType}
              onChange={(_, value) => {
                value &&
                  setCurrentOrder((prev) => {
                    return (
                      prev && {
                        ...prev,
                        coffeeType: value,
                      }
                    );
                  });
              }}
            >
              <Button value={CoffeeType.CAPPUCCINO}>
                {CoffeeType.CAPPUCCINO}
              </Button>
              <Button value={CoffeeType.ESPRESSO}>{CoffeeType.ESPRESSO}</Button>
              <Button value={CoffeeType.LATTE_MACHIATTO}>
                {CoffeeType.LATTE_MACHIATTO}
              </Button>
            </ToggleButtonGroup>
            <Typography level="title-md">Strength</Typography>
            <ToggleButtonGroup
              value={currentOrder.strength}
              onChange={(_, value) => {
                value &&
                  setCurrentOrder(
                    (prev) =>
                      prev && {
                        ...prev,
                        strength: value,
                      },
                  );
              }}
            >
              <Button value={Strength.NO_CAFFEINE}>
                {Strength.NO_CAFFEINE}
              </Button>
              <Button value={Strength.LIGHT}>{Strength.LIGHT}</Button>
              <Button value={Strength.MEDIUM}>{Strength.MEDIUM}</Button>
              <Button value={Strength.STRONG}>{Strength.STRONG}</Button>
            </ToggleButtonGroup>
            <Button sx={{ mt: 3 }} onClick={order}>
              Order
            </Button>
          </ModalDialog>
        </Modal>
      )}
      {board.map((row, y) =>
        row.map((cell, x) => (
          <div
            className={tm(
              "relative border-t border-r border-gray-300 flex justify-center items-center",
              (!hasSimulationStarted || cell === Cell.TABLE) &&
                "hover:bg-blue-50",
            )}
            key={`${x}${y}`}
            style={{
              height: cellSize,
              width: cellSize,
              cursor:
                !hasSimulationStarted || cell === Cell.TABLE
                  ? "pointer"
                  : "default",
            }}
            onClick={() =>
              hasSimulationStarted
                ? cell === Cell.TABLE &&
                  setCurrentOrder({
                    tableNr: [x, y],
                    coffeeType: CoffeeType.CAPPUCCINO,
                    strength: Strength.MEDIUM,
                  })
                : setCell(x, y)
            }
            onMouseMove={() => {
              if (!hasSimulationStarted && isMouseDown) {
                setCell(x, y);
              }
            }}
          >
            <CellImage
              cellType={cell}
              cellSize={cellSize}
              hasRobot={x === robotPosition?.[0] && y === robotPosition?.[1]}
            />
            <div
              className={tm(
                "absolute bottom-0 w-full bg-amber-200",
                coffeeMachineState.progress === 100 && "bg-emerald-200",
                coffeeMachineState.error && "bg-red-300",
              )}
              style={{
                height:
                  cell === Cell.COFFEE_MACHINE
                    ? `${coffeeMachineState.progress}%`
                    : 0,
                zIndex: 5,
              }}
            />
          </div>
        )),
      )}
    </div>
  );
}
