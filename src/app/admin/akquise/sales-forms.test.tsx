import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createLeadAction: vi.fn(async (state) => state),
  deleteLeadAction: vi.fn(async (state) => state),
  deleteLeadBatchAction: vi.fn(async () => ({ message: "", error: false })),
  importSalesCsvAction: vi.fn(async (state) => state),
  saveSalesTemplateAction: vi.fn(async (state) => state),
  startOutreachAction: vi.fn(async (state) => state),
  updateLeadAction: vi.fn(async (state) => state),
}));

import { OutreachForm } from "./sales-forms";
import { deleteLeadBatchAction } from "./actions";

const leads = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    companyName: "Fahrschule Nord",
    contactName: null,
    email: null,
    phone: null,
    website: null,
    tags: '["Rechtlich veraltet"]',
    researchNote: "Impressum prüfen",
    status: "new",
    emailPermission: "unknown",
    emailOptOutAt: null,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    companyName: "Fahrschule Süd",
    contactName: null,
    email: null,
    phone: null,
    website: null,
    tags: '["Aktuelle Wartungen"]',
    researchNote: "Wartungsseite erreichbar",
    status: "new",
    emailPermission: "unknown",
    emailOptOutAt: null,
  },
];

describe("Akquise-Kontaktauswahl", () => {
  it("markiert alle sichtbaren Kontakte und aktiviert die Sammellöschung", async () => {
    const user = userEvent.setup();
    render(
      <OutreachForm
        leads={leads}
        templates={[{ id: "template-1", name: "Vorlage" }]}
      />,
    );

    const deleteButton = screen.getByRole("button", {
      name: "0 Kontakte löschen",
    });
    expect(deleteButton).toBeDisabled();

    await user.click(
      screen.getByRole("checkbox", {
        name: "Alle sichtbaren Kontakte auswählen",
      }),
    );

    expect(
      screen.getByRole("checkbox", { name: "Fahrschule Nord auswählen" }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Fahrschule Süd auswählen" }),
    ).toBeChecked();
    const activeDeleteButton = screen.getByRole("button", {
      name: "2 Kontakte löschen",
    });
    expect(activeDeleteButton).toBeEnabled();

    vi.spyOn(window, "confirm").mockReturnValueOnce(true);
    await user.click(activeDeleteButton);
    await waitFor(() => expect(deleteLeadBatchAction).toHaveBeenCalledOnce());
    const submitted = vi.mocked(deleteLeadBatchAction).mock.calls[0]?.[1];
    expect(submitted?.getAll("leadIds")).toEqual(leads.map((lead) => lead.id));
  });

  it("begrenzt die Gesamtauswahl auf den gewählten Tag", async () => {
    const user = userEvent.setup();
    render(
      <OutreachForm
        leads={leads}
        templates={[{ id: "template-1", name: "Vorlage" }]}
      />,
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Nach Tag filtern" }),
      "Rechtlich veraltet",
    );
    await user.click(
      screen.getByRole("checkbox", {
        name: "Alle sichtbaren Kontakte auswählen",
      }),
    );

    expect(
      screen.getByRole("button", { name: "1 Kontakt löschen" }),
    ).toBeEnabled();
    expect(screen.queryByText("Fahrschule Süd")).not.toBeInTheDocument();
  });
});
