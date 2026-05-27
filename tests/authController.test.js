// Load environment variables from the backend's .env file
// This makes config.mongoUri available so db.js doesn't crash when required
require("dotenv").config({ path: "./.env" });

// Import the login function we want to test
const { login } = require("../backend/controllers/authController");

// Import the db module so we can control its behavior in the test
const db = require("../backend/db");

// Tell Jest to replace the real db module with an auto-generated mock
// This prevents real database connections during testing
jest.mock("../backend/db");

// Group related tests for the login() function
describe("login()", () => {
  test("should login successfully", async () => {
    // --- Arrange: set up fake input and dependencies ---

    // Fake request object simulating what Express would pass in
    const req = {
      body: {
        email: "test@test.com",
        password: "1234",
      },
    };

    // Fake response object with mocked status() and json() methods
    // mockReturnThis() allows method chaining like res.status(200).json(...)
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Fake user document that we pretend MongoDB returns
    const fakeUser = {
      email: "test@test.com",
      password: "1234",
    };

    // Configure the mocked getDB() to return a fake database object
    // The chain mimics: db.collection("users").findOne({...}) => fakeUser
    db.getDB.mockReturnValue({
      collection: () => ({
        findOne: jest.fn().mockResolvedValue(fakeUser),
      }),
    });

    // --- Act: call the function under test ---
    await login(req, res);

    // --- Assert: verify the function behaved as expected ---
    // Since a user was "found", login should respond with status 200
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
