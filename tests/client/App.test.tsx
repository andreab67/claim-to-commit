// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "../../src/client/App";
import demoAudit from "../../fixtures/demo-scan.json";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function mockDemo() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(demoAudit),
    }),
  );
}

describe("Claim to Commit workbench", () => {
  it("reveals the complete headline evidence chain", async () => {
    mockDemo();
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: "Claims are graded by transparent deterministic rules",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();

    const chain = screen.getByLabelText("Evidence chain");
    for (const label of [
      "Decision",
      "Session",
      "Commit",
      "File",
      "Test",
      "Screenshot",
    ]) {
      expect(within(chain).getByText(label)).toBeInTheDocument();
    }
  });

  it("turns unsupported confidence into an explicit audit finding", async () => {
    mockDemo();
    render(<App />);
    await screen.findByText("70%");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Automatically infers evidence relationships with perfect accuracy",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Enable Audit Mode" }));

    expect(screen.getByRole("button", { name: "Disable Audit Mode" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No implementation commit proves this claim.",
    );
    expect(screen.getByText("Confident prose is not proof.")).toBeInTheDocument();
  });

  it("submits a local repository path and displays the returned audit", async () => {
    mockDemo();
    render(<App />);
    await screen.findByText("70%");

    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(demoAudit),
    } as Response);

    fireEvent.click(screen.getByRole("button", { name: "Scan a local repository" }));
    fireEvent.change(screen.getByLabelText("Repository path"), {
      target: { value: "C:\\projects\\claim-to-commit" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Run evidence scan" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/scans",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
