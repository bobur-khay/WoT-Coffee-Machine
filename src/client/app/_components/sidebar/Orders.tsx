import { Alert, Typography } from "@mui/joy";
import { Order } from "../../../../constants";
import { Warning } from "@mui/icons-material";

export function Orders({
  robotQueue,
  coffeeMachineError,
}: {
  robotQueue: Order[];
  coffeeMachineError: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {coffeeMachineError && (
        <Alert startDecorator={<Warning />} variant="soft" color="danger">
          {coffeeMachineError}
        </Alert>
      )}
      {robotQueue.map((order) => (
        <div>
          <Typography level="title-lg">
            Table {order.tableNr[0]}, {order.tableNr[1]}
          </Typography>
          <Typography>
            {order.coffeeType}: {order.strength}
          </Typography>
        </div>
      ))}
    </div>
  );
}
