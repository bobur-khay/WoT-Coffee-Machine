import { ReactElement, ReactNode } from "react";
import wall from "@/public/wall.png";
import robot from "@/public/robot.png";
import caffeeMachine from "@/public/caffe_machine.png";
import { Close, Person } from "@mui/icons-material";
import { Cell } from "../../../constants";

export function CellImage({
  cellType,
  cellSize,
  customIcon,
  hasRobot,
}: {
  cellType: Cell;
  cellSize: number;
  customIcon?: ReactElement;
  hasRobot?: boolean;
}) {
  return (
    <div className="h-full w-full relative flex items-center justify-center">
      {
        (
          {
            [Cell.TABLE]: <Person sx={{ fontSize: cellSize }} />,
            [Cell.WALL]: (
              <img
                src={wall.src}
                style={{
                  height: "80%",
                  width: "auto",
                  objectFit: "contain",
                  pointerEvents: "none",
                }}
              />
            ),
            [Cell.COFFEE_MACHINE]: (
              <img
                src={caffeeMachine.src}
                style={{
                  height: "80%",
                  width: "auto",
                  objectFit: "contain",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              />
            ),
            [Cell.NONE]: null,
          } satisfies Record<Cell, ReactNode>
        )[cellType]
      }
      {hasRobot && (
        <div className="absolute top-0 left-0 h-full w-full flex justify-center items-center backdrop-blur-[1px] z-20">
          <img
            src={robot.src}
            style={{
              height: "80%",
              width: "auto",
              objectFit: "contain",
              pointerEvents: "none",
            }}
          />
        </div>
      )}
      {customIcon}
    </div>
  );
}
