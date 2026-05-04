// Unit tests for the validateEvent function.
// These tests verify that the function correctly accepts valid events
// and rejects invalid ones, returning appropriate error messages.

const validateEvent = require("./scripts/validateEvent");

describe("validateEvent", () => {
  // A reusable valid event object that we can spread into each test
  // and override specific fields to test individual rules in isolation.
  // This keeps tests short and focused on what is actually being tested.
  const validEvent = {
    title: "Fredagsbar",
    date: "2026-12-31",
    startTime: "16:00",
    endTime: "20:00",
    categories: ["social"],
  };

  // --- Successful path ---
  // First we verify that a fully valid event passes validation.
  // If this test fails, something is fundamentally wrong with the function.
  test("accepts a valid event", () => {
    const result = validateEvent(validEvent);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  // --- Title validation ---
  // The title field must not be empty. We test both an empty string
  // and a string containing only whitespace, since trim() should catch both.
  test("rejects empty title", () => {
    const result = validateEvent({ ...validEvent, title: "" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Title is required");
  });

  test("rejects title with only whitespace", () => {
    const result = validateEvent({ ...validEvent, title: "   " });
    expect(result.valid).toBe(false);
  });

  // --- Time validation ---
  // The end time must be strictly after the start time.
  // We test both "before" and "equal" to cover the boundary case.
  test("rejects end time before start time", () => {
    const result = validateEvent({
      ...validEvent,
      startTime: "20:00",
      endTime: "16:00",
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("End time must be after start time");
  });

  test("rejects end time equal to start time", () => {
    const result = validateEvent({
      ...validEvent,
      startTime: "16:00",
      endTime: "16:00",
    });
    expect(result.valid).toBe(false);
  });

  // --- Date validation (no events in the past) ---
  // Events must be scheduled from tomorrow onwards.
  // We use a hardcoded past date to verify that the rule rejects it.
  test("rejects a date in the past", () => {
    const result = validateEvent({
      ...validEvent,
      date: "2003-08-12",
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Event date must be in the future (from tomorrow)",
    );
  });

  // --- Category validation ---
  // The user must select at least one category when creating an event.
  test("rejects event with no categories", () => {
    const result = validateEvent({ ...validEvent, categories: [] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Please select at least one category");
  });

  // --- Multiple errors ---
  // When several fields are invalid at the same time, the function
  // should collect all errors instead of stopping at the first one.
  // This gives the user complete feedback in a single submission.
  test("accumulates multiple errors", () => {
    const result = validateEvent({
      title: "",
      date: "",
      startTime: "",
      endTime: "",
      categories: [],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
