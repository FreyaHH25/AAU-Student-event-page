# AAU-Student-event-page

A web application for AAU students to view and manage university events.
Built with Node.js, Express, and MongoDB.

## Features

- User login
- Event overview and calendar view
- Create new events
- Personalized header with student name and semester

## Prerequisites

Before you start, make sure you have installed:

- [Node.js](https://nodejs.org/)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/FreyaHH25/AAU-Student-event-page.git
cd AAU-Student-event-page
```

### 2. Install dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`, including
Express, MongoDB, dotenv, cors, and Jest.

### 3. Create a `.env` file

Create a file called `.env` in the `backend/` folder with the following content:

MONGO_URI=your_mongodb_connection_string_here
PORT=3000

Replace `your_mongodb_connection_string_here` with your actual MongoDB Atlas
connection string.

> Note: The `.env` file is ignored by Git and should never be committed.

## Running the App

### Start the server

From the project root, run:

```bash
npm start
```

The server will start on `http://localhost:3000`.

### Open the app

Open `public/login_page.html` in VS Code, right click and choose "Open with Live Server"

## Running Tests

The project uses [Jest](https://jestjs.io/) for unit testing.

To run all tests:

```bash
npm test
```

Test files are located in the `tests/` folder and follow the naming convention
`*.test.js`.

## Authors

- Freya Hedegaard Hansen ([@FreyaHH25](https://github.com/FreyaHH25))
- Marius Piasecki Frey Hansen
- Filip Sukhanov
- Abdulhady Ghabour
- Marzia Yousofi
