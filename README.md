# AAU-Student-event-page

A web application for AAU students to view and manage university events.
Built with Node.js, Express, and MongoDB.

## Features

- User login
- Event overview and calendar view
- Create new events
- Personalized header with student name and semester

## Prerequisites

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

Create a file called `.env` in the root.
You can copy the structure from .env.example and replace "your_mongodb_connection_string" with the connection string.

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

Example login
To make it easy to test the application, you can log in with the following demo account:

Username: stud1@student.aau.dk
Password: 12345

This account already contains sample data so you can explore the event overview, calendar view, and the personalized header.

## Running Tests

The project uses [Jest](https://jestjs.io/) for unit testing.

To run all tests:

```bash
npm test
```

Test files are located in the `tests/` folder and follow the naming convention
`*.test.js`.

## Authors

- Abdulhady Ghabour
- Freya Hedegaard Hansen ([@FreyaHH25](https://github.com/FreyaHH25))
- Filip Sukhanov
- Japjot Singh
- Marius Piasecki Frey Hansen
- Marzia Yousofi
