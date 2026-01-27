import { ReactNode } from "react";
import wall from "@/public/wall.png";
import robot from "@/public/robot.png";
import caffeeMachine from "@/public/caffe_machine.png";
import { Close, Person } from "@mui/icons-material";
import { CellType } from "../../../constants";

export function CellImage({
  cellType,
  cellSize,
  isEmptyCross,
  isRobot,
}: {
  cellType: CellType;
  cellSize: number;
  isEmptyCross?: boolean;
  isRobot?: boolean;
}) {
  return (
    <div className="h-full w-full relative flex items-center justify-center">
      {
        (
          {
            [CellType.TABLE]: <Person sx={{ fontSize: cellSize }} />,
            [CellType.WALL]: (
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
            [CellType.ROBOT]: null,
            [CellType.COFFEE_MACHINE]: (
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
            [CellType.NONE]: isEmptyCross ? (
              <Close sx={{ fontSize: cellSize }} />
            ) : null,
          } satisfies Record<CellType, ReactNode>
        )[cellType]
      }
      {isRobot && (
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
    </div>
  );
}
