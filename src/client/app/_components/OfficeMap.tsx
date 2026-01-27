"use client";
import { MapType } from "@/app/page";
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

import { Strength, CoffeeType, CellType, Order } from "../../../constants";

export function OfficeMap({
  map,
  setMap,
  editMode,
  hasStarted,
  robotPosition,
  setRobotPosition,
}: {
  map: MapType;
  setMap: Dispatch<SetStateAction<MapType>>;
  editMode: CellType;
  hasStarted: boolean;
  robotPosition: number[] | null;
  setRobotPosition: (pos: number[] | null) => void;
}) {
  const mapSize = map.length;
  const [mapSizePx, setMapSizePx] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [modalOrder, setModalOrder] = useState<Order | null>(null);
  const [coffeeMachineProgress, setCoffeeMachineProgress] = useState(0);

  const hasStartedRef = useRef(hasStarted);

  const cellSize = (mapSizePx - 2) / mapSize;
  const configMap = () => {
    const sidebar = document.getElementById("sidebar");
    const sidebarWidth = sidebar?.offsetWidth ?? 0;
    const screenWidth = document.body.clientWidth - 2 * PAGE_PADDING;
    const sidebarHeight = sidebar?.offsetHeight ?? 0;
    const mapMaxWidth = screenWidth - sidebarWidth - 16;
    let mapSizePx = 0;
    if (mapMaxWidth < sidebarHeight) {
      mapSizePx = mapMaxWidth;
    } else {
      mapSizePx = sidebarHeight;
    }
    setMapSizePx(mapSizePx);
  };

  useEffect(() => {
    configMap();
    window.addEventListener("resize", configMap);
    window.addEventListener("mousedown", () => {
      setIsMouseDown(true);
    });
    window.addEventListener("mouseup", () => {
      setIsMouseDown(false);
    });
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
    if (!hasStarted) {
      setCoffeeMachineProgress(0);
    }
    hasStartedRef.current = hasStarted;
    (async () => {
      while (hasStartedRef.current) {
        const coffeeRes = await fetch("api/status/coffee", {
          cache: "no-store",
        });
        const status = await coffeeRes.json();
        setCoffeeMachineProgress(status);
        const robotRes = await fetch("api/status/robot", { cache: "no-store" });
        const position = await robotRes.json();
        position && setRobotPosition(position);
        await new Promise((r) => setTimeout(r, 200));
      }
    })();
  }, [hasStarted]);

  const setCell = (x: number, y: number) => {
    if (editMode === CellType.ROBOT) {
      setRobotPosition([x, y]);
    } else {
      if (
        editMode === CellType.NONE &&
        x === robotPosition?.[0] &&
        y === robotPosition[1]
      ) {
        setRobotPosition(null);
      }
      setMap((prev) => {
        let prevMap = [...prev];
        if (editMode === CellType.COFFEE_MACHINE) {
          prevMap = prevMap.map((row) =>
            row.map((cell) =>
              cell === CellType.COFFEE_MACHINE ? CellType.NONE : cell,
            ),
          );
        }
        prevMap[y][x] = editMode;
        return prevMap;
      });
    }
  };

  const order = async () => {
    setModalOrder(null);
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modalOrder),
    });
    if (!res.ok) {
      alert("An error occured, pls refresh and try again");
    }
  };

  return (
    <div
      className="gap-0 flex flex-wrap border border-gray-600 content-start select-none"
      style={{
        width: mapSizePx,
        height: mapSizePx,
      }}
    >
      {modalOrder && (
        <Modal open onClose={() => setModalOrder(null)}>
          <ModalDialog>
            <ModalClose />
            <Typography level="title-lg">
              Table Order:
              {`(${modalOrder?.tableNr[0]}, ${modalOrder?.tableNr[1]})`}
            </Typography>
            <Typography level="title-md">Caffee Type</Typography>
            <ToggleButtonGroup
              value={modalOrder.coffeeType}
              onChange={(_, value) => {
                value &&
                  setModalOrder((prev) => {
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
              <Button value={CoffeeType.LATTE_MACHIATO}>
                {CoffeeType.LATTE_MACHIATO}
              </Button>
            </ToggleButtonGroup>
            <Typography level="title-md">Strength</Typography>
            <ToggleButtonGroup
              value={modalOrder.strength}
              onChange={(_, value) => {
                value &&
                  setModalOrder(
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
      {map.map((row, y) =>
        row.map((cell, x) => (
          <div
            className={tm(
              "relative border-t border-r border-gray-300 flex justify-center items-center",
              (!hasStarted || cell === CellType.TABLE) && "hover:bg-blue-50",
            )}
            key={`${x}${y}`}
            style={{
              height: cellSize,
              width: cellSize,
              cursor:
                !hasStarted || cell === CellType.TABLE ? "pointer" : "default",
            }}
            onClick={() =>
              hasStarted
                ? cell === CellType.TABLE &&
                  setModalOrder({
                    tableNr: [x, y],
                    coffeeType: CoffeeType.CAPPUCCINO,
                    strength: Strength.MEDIUM,
                  })
                : setCell(x, y)
            }
            onMouseMove={() => {
              if (!hasStarted && isMouseDown) {
                setCell(x, y);
              }
            }}
          >
            <CellImage
              cellType={cell}
              cellSize={cellSize}
              isRobot={x === robotPosition?.[0] && y === robotPosition?.[1]}
            />
            <div
              className={tm(
                "absolute bottom-0 w-full bg-amber-200",
                coffeeMachineProgress === 100 && "bg-emerald-200",
              )}
              style={{
                height:
                  cell === CellType.COFFEE_MACHINE
                    ? `${coffeeMachineProgress}%`
                    : 0,
                zIndex: 15,
              }}
            />
          </div>
        )),
      )}
    </div>
  );
}
