# WoT Tutorial Project

A Web of Things (WoT) simulation platform featuring a smart coffee machine and a delivery robot, with a modern web client for interaction and visualization. This project demonstrates WoT concepts using Node-WoT, Next.js, and TypeScript.

## Project Structure

```
WoT tutorial/
├── package.json
├── pnpm-lock.yaml
├── README.md
├── td.json
├── tsconfig.json
├── src/
│   ├── constants.ts         # Shared types and enums
│   ├── client/             # Next.js web client
│   │   ├── app/            # Main app, components, API routes
│   │   ├── public/         # Static assets
│   │   ├── utils.ts        # Utility functions
│   │   └── ...
│   └── things/             # WoT Things (servers)
│       ├── coffee/         # Coffee machine servient
│       │   └── server.ts
│       └── robot/          # Robot servient
│           └── server.ts
```

## Features

- **WoT Coffee Machine**: Simulates a smart coffee machine with order queue, state, and error handling.
- **WoT Robot**: Simulates a delivery robot that fetches coffee and delivers it to tables.
- **Web Client**: Interactive UI to place orders, view robot/coffee status, and edit the office map.
- **API**: Next.js API routes for initializing, ordering, resetting, and status polling.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)

### Install Dependencies

```bash
pnpm install
```

### Running the Project

Open three terminals and run each service:

1. **Client (Web UI):**

   ```bash
   pnpm run dev:client
   ```

   Runs the Next.js client at http://localhost:3000

2. **Coffee Machine Servient:**

   ```bash
   pnpm run dev:coffee
   ```

   Starts the WoT coffee machine on CoAP (default port 8080)

3. **Robot Servient:**
   ```bash
   pnpm run dev:robot
   ```
   Starts the WoT robot on HTTP (default port 8081)

### Usage

- Access the web client to place coffee orders, view robot and coffee machine status, and edit the office layout.
- The robot and coffee machine communicate using WoT protocols (CoAP/HTTP) and update the UI in real time.

## Technologies Used

- **Node-WoT**: WoT runtime for Thing Description, Servient, and protocol bindings
- **Next.js**: React-based web framework for the client
- **TypeScript**: Type safety across client and server
- **MUI Joy UI**: UI components
- **Tailwind CSS**: Utility-first CSS framework

## Folder Details

- `src/constants.ts`: Shared enums, types, and constants for both things and client
- `src/client/`: Next.js app, UI components, and API routes
- `src/things/coffee/server.ts`: Coffee machine WoT servient
- `src/things/robot/server.ts`: Robot WoT servient

## Customization

- Edit `src/constants.ts` to change coffee types, strengths, or map cell types.
- Extend the client UI or add new API endpoints in `src/client/app/api/`.

## License

ISC

---

This project is for educational purposes and demonstrates Web of Things concepts in a simulated environment.
