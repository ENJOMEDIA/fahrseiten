import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OnboardingLinkForm } from "./onboarding-link-form";
import { TenantOnboardingForm } from "./setup-form";

afterEach(() => vi.unstubAllGlobals());

function failedResponse(message: string) {
  return Promise.resolve(
    new Response(JSON.stringify({ message }), {
      status: 422,
      headers: { "content-type": "application/json" },
    }),
  );
}

describe("onboarding form feedback", () => {
  it("shows progress for email invitations and keeps admin input after an error", async () => {
    const user = userEvent.setup();
    let resolveRequest!: (response: Response) => void;
    const request = new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    });
    const fetchMock = vi.fn(() => request);
    vi.stubGlobal("fetch", fetchMock);

    render(
      <OnboardingLinkForm
        plans={[
          {
            id: "61000000-0000-4000-8000-000000000001",
            name: "Startklar",
            monthlyPriceCents: 4999,
            setupPriceCents: 4999,
            annualBillingEnabled: true,
            annualDiscountBasisPoints: 1000,
            minimumTermMonths: 1,
          },
        ]}
      />,
    );
    const company = screen.getByLabelText("Fahrschule / Firma");
    await user.type(company, "Fahrschule Nord");
    await user.type(
      screen.getByLabelText("E-Mail des Kunden"),
      "kontakt@example.test",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: /Gebuchtes Paket/ }),
      "61000000-0000-4000-8000-000000000001",
    );
    await user.click(
      screen.getByRole("button", { name: "Erstellen & per E-Mail senden" }),
    );

    expect(
      screen.getByRole("button", {
        name: "Instanz wird erstellt & E-Mail versendet …",
      }),
    ).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Instanz und Einrichtungslink werden erstellt",
    );

    resolveRequest(
      await failedResponse("Für diesen Lead existiert bereits ein Link."),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Für diesen Lead existiert bereits ein Link.",
    );
    expect(company).toHaveValue("Fahrschule Nord");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("keeps customer onboarding fields after server validation fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => failedResponse("Bitte die Pflichtangaben prüfen.")),
    );
    render(
      <TenantOnboardingForm
        prefill={{
          companyName: "Fahrschule Nord",
          ownerName: "Erika Beispiel",
          ownerEmail: "erika@example.test",
          domain: "nord.example.test",
        }}
        token="abcdefghijklmnopqrstuvwxyz1234567890"
      />,
    );

    const street = screen.getByLabelText("Straße und Hausnummer", {
      selector: 'input[name="street"]',
    });
    await user.type(
      screen.getByLabelText("Passwort für den Kundenbereich"),
      "EinSicheresPasswort!24",
    );
    await user.type(street, "Musterstraße 12");
    await user.type(screen.getByLabelText("Postleitzahl"), "12345");
    await user.type(screen.getByLabelText("Ort"), "Musterstadt");
    await user.type(screen.getByLabelText("Hosting-Anbieter"), "netcup GmbH");
    await user.click(
      screen.getByRole("checkbox", {
        name: /Paket- und Abrechnungsauswahl geprüft/,
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Fahrschulseite einrichten" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Bitte die Pflichtangaben prüfen.",
    );
    expect(street).toHaveValue("Musterstraße 12");
  });
});
