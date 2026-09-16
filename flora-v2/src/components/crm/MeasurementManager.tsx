"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Measurement = {
  id: string;
  siteVisitId: string;
  roomName: string;
  openingName: string | null;
  openingType: string | null;
  width: number;
  height: number;
  unit: "MM" | "CM" | "M" | "FT" | "IN";
  quantity: number;
  curtainType: string | null;
  trackType: string | null;
  remarks: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type Props = {
  siteVisitId: string;
  initialMeasurements: Measurement[];
};

type FormState = {
  roomName: string;
  openingName: string;
  openingType: string;
  width: string;
  height: string;
  unit: Measurement["unit"];
  quantity: string;
  curtainType: string;
  trackType: string;
  remarks: string;
};

const field =
  "border border-[#D8C9BC] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#5A0E12] bg-[#F8F5F2] w-full";

const label =
  "text-[10px] uppercase tracking-widest text-[#6B625A] block mb-1";

const emptyForm: FormState = {
  roomName: "",
  openingName: "",
  openingType: "",
  width: "",
  height: "",
  unit: "MM",
  quantity: "1",
  curtainType: "",
  trackType: "",
  remarks: "",
};

function formatUnit(unit: Measurement["unit"]) {
  switch (unit) {
    case "MM":
      return "mm";
    case "CM":
      return "cm";
    case "M":
      return "m";
    case "FT":
      return "ft";
    case "IN":
      return "in";
    default:
      return unit;
  }
}

function formatNumber(value: number) {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(2).replace(/\.?0+$/, "");
}

export function MeasurementManager({
  siteVisitId,
  initialMeasurements,
}: Props) {
  const router = useRouter();

  const [measurements, setMeasurements] =
    useState<Measurement[]>(initialMeasurements);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function startEdit(measurement: Measurement) {
    setEditingId(measurement.id);

    setForm({
      roomName: measurement.roomName,
      openingName: measurement.openingName ?? "",
      openingType: measurement.openingType ?? "",
      width: String(measurement.width),
      height: String(measurement.height),
      unit: measurement.unit,
      quantity: String(measurement.quantity),
      curtainType: measurement.curtainType ?? "",
      trackType: measurement.trackType ?? "",
      remarks: measurement.remarks ?? "",
    });

    setError("");
    setShowForm(true);
  }

  function updateField(
    fieldName: keyof FormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [fieldName]: value,
    }));
  }

  async function saveMeasurement() {
    setError("");

    if (!form.roomName.trim()) {
      setError("Room name is required.");
      return;
    }

    if (!form.width || Number(form.width) <= 0) {
      setError("Enter a valid width.");
      return;
    }

    if (!form.height || Number(form.height) <= 0) {
      setError("Enter a valid height.");
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Enter a valid quantity.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...(editingId
          ? {}
          : {
              siteVisitId,
            }),

        roomName: form.roomName.trim(),
        openingName:
          form.openingName.trim() || null,
        openingType:
          form.openingType.trim() || null,
        width: Number(form.width),
        height: Number(form.height),
        unit: form.unit,
        quantity: Number(form.quantity),
        curtainType:
          form.curtainType.trim() || null,
        trackType:
          form.trackType.trim() || null,
        remarks:
          form.remarks.trim() || null,
      };

      const url = editingId
        ? `/api/measurements/${editingId}`
        : "/api/measurements";

      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          data?.error ??
            "Failed to save measurement."
        );
        return;
      }

      if (editingId) {
        setMeasurements((current) =>
          current.map((item) =>
            item.id === editingId
              ? data
              : item
          )
        );
      } else {
        setMeasurements((current) => [
          ...current,
          data,
        ]);
      }

      resetForm();
      router.refresh();
    } catch {
      setError(
        "Something went wrong while saving the measurement."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteMeasurement(
    measurementId: string
  ) {
    const confirmed = window.confirm(
      "Delete this measurement? This action cannot be undone."
    );

    if (!confirmed) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `/api/measurements/${measurementId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          data?.error ??
            "Failed to delete measurement."
        );
        return;
      }

      setMeasurements((current) =>
        current.filter(
          (item) => item.id !== measurementId
        )
      );

      if (editingId === measurementId) {
        resetForm();
      }

      router.refresh();
    } catch {
      setError(
        "Something went wrong while deleting the measurement."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-t border-[#EFE7DF] mt-5 pt-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="font-semibold text-sm text-[#5A0E12]">
            Measurements
          </h4>

          <p className="text-xs text-[#6B625A] mt-1">
            Record window and curtain measurements for
            this visit.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={startCreate}
            className="bg-[#5A0E12] text-white rounded-lg px-3 py-2 text-xs font-medium hover:bg-[#74171C] transition-colors"
          >
            + Add Measurement
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-[#E8B4B4] bg-[#FEF2F2] px-3 py-2 text-sm text-[#991B1B]">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="border border-[#D8C9BC] rounded-xl p-4 mb-5 bg-[#FCFAF8]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="font-semibold text-sm text-[#5A0E12]">
                {editingId
                  ? "Edit Measurement"
                  : "Add Measurement"}
              </h5>

              <p className="text-xs text-[#6B625A] mt-1">
                Enter the exact dimensions recorded on
                site.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="text-[#6B625A] hover:text-[#5A0E12] text-sm"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room */}
            <div>
              <label className={label}>
                Room *
              </label>

              <input
                className={field}
                placeholder="Master Bedroom"
                value={form.roomName}
                onChange={(e) =>
                  updateField(
                    "roomName",
                    e.target.value
                  )
                }
              />
            </div>

            {/* Opening */}
            <div>
              <label className={label}>
                Opening
              </label>

              <input
                className={field}
                placeholder="Window 1"
                value={form.openingName}
                onChange={(e) =>
                  updateField(
                    "openingName",
                    e.target.value
                  )
                }
              />
            </div>

            {/* Opening Type */}
            <div>
              <label className={label}>
                Opening Type
              </label>

              <select
                className={field}
                value={form.openingType}
                onChange={(e) =>
                  updateField(
                    "openingType",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select opening type
                </option>
                <option value="WINDOW">
                  Window
                </option>
                <option value="DOOR">
                  Door
                </option>
                <option value="SLIDING_DOOR">
                  Sliding Door
                </option>
                <option value="FRENCH_DOOR">
                  French Door
                </option>
                <option value="CURTAIN_WALL">
                  Curtain Wall
                </option>
                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>

            {/* Curtain Type */}
            <div>
              <label className={label}>
                Curtain Type
              </label>

              <input
                className={field}
                placeholder="Blackout / Sheer / Double"
                value={form.curtainType}
                onChange={(e) =>
                  updateField(
                    "curtainType",
                    e.target.value
                  )
                }
              />
            </div>

            {/* Width */}
            <div>
              <label className={label}>
                Width *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                className={field}
                placeholder="2400"
                value={form.width}
                onChange={(e) =>
                  updateField(
                    "width",
                    e.target.value
                  )
                }
              />
            </div>

            {/* Height */}
            <div>
              <label className={label}>
                Height *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                className={field}
                placeholder="1800"
                value={form.height}
                onChange={(e) =>
                  updateField(
                    "height",
                    e.target.value
                  )
                }
              />
            </div>

            {/* Unit */}
            <div>
              <label className={label}>
                Unit *
              </label>

              <select
                className={field}
                value={form.unit}
                onChange={(e) =>
                  updateField(
                    "unit",
                    e.target.value
                  )
                }
              >
                <option value="MM">
                  Millimetres (mm)
                </option>

                <option value="CM">
                  Centimetres (cm)
                </option>

                <option value="M">
                  Metres (m)
                </option>

                <option value="FT">
                  Feet (ft)
                </option>

                <option value="IN">
                  Inches (in)
                </option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className={label}>
                Quantity *
              </label>

              <input
                type="number"
                min="1"
                step="1"
                className={field}
                value={form.quantity}
                onChange={(e) =>
                  updateField(
                    "quantity",
                    e.target.value
                  )
                }
              />
            </div>

            {/* Track Type */}
            <div className="md:col-span-2">
              <label className={label}>
                Track Type
              </label>

              <input
                className={field}
                placeholder="Ceiling track / Wall track / Motorized"
                value={form.trackType}
                onChange={(e) =>
                  updateField(
                    "trackType",
                    e.target.value
                  )
                }
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label className={label}>
                Remarks
              </label>

              <textarea
                className={field}
                rows={3}
                placeholder="Any installation notes, obstructions, special requirements..."
                value={form.remarks}
                onChange={(e) =>
                  updateField(
                    "remarks",
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={saveMeasurement}
              disabled={loading}
              className="bg-[#5A0E12] text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-[#74171C] disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingId
                  ? "Update Measurement"
                  : "Save Measurement"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="bg-[#EFE7DF] text-[#6B625A] rounded-lg px-5 py-2 text-sm hover:bg-[#E7DDD3]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty */}
      {measurements.length === 0 && !showForm && (
        <div className="border border-dashed border-[#D8C9BC] rounded-xl p-6 text-center">
          <div className="text-2xl mb-2">⌗</div>

          <p className="text-sm font-medium text-[#1E1B18]">
            No measurements recorded
          </p>

          <p className="text-xs text-[#6B625A] mt-1">
            Add the room and opening dimensions
            collected during the visit.
          </p>
        </div>
      )}

      {/* Measurement List */}
      {measurements.length > 0 && (
        <div className="space-y-3">
          {measurements.map((measurement, index) => (
            <div
              key={measurement.id}
              className="border border-[#D8C9BC] rounded-xl p-4 bg-[#FCFAF8]"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Main */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-[#6B625A]">
                      #{index + 1}
                    </span>

                    <h5 className="font-semibold text-sm text-[#1E1B18]">
                      {measurement.roomName}
                    </h5>

                    {measurement.openingName && (
                      <span className="text-sm text-[#6B625A]">
                        · {measurement.openingName}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#6B625A]">
                        Size
                      </span>

                      <p className="text-sm font-semibold">
                        {formatNumber(
                          measurement.width
                        )}{" "}
                        ×{" "}
                        {formatNumber(
                          measurement.height
                        )}{" "}
                        {formatUnit(
                          measurement.unit
                        )}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#6B625A]">
                        Quantity
                      </span>

                      <p className="text-sm font-semibold">
                        {measurement.quantity}
                      </p>
                    </div>

                    {measurement.openingType && (
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-[#6B625A]">
                          Opening
                        </span>

                        <p className="text-sm font-medium">
                          {measurement.openingType.replace(
                            /_/g,
                            " "
                          )}
                        </p>
                      </div>
                    )}

                    {measurement.curtainType && (
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-[#6B625A]">
                          Curtain
                        </span>

                        <p className="text-sm font-medium">
                          {measurement.curtainType}
                        </p>
                      </div>
                    )}

                    {measurement.trackType && (
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-[#6B625A]">
                          Track
                        </span>

                        <p className="text-sm font-medium">
                          {measurement.trackType}
                        </p>
                      </div>
                    )}
                  </div>

                  {measurement.remarks && (
                    <div className="mt-3 pt-3 border-t border-[#EFE7DF]">
                      <span className="text-[10px] uppercase tracking-widest text-[#6B625A]">
                        Remarks
                      </span>

                      <p className="text-sm text-[#6B625A] mt-1 whitespace-pre-wrap">
                        {measurement.remarks}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      startEdit(measurement)
                    }
                    disabled={loading}
                    className="border border-[#D8C9BC] rounded-lg px-3 py-1.5 text-xs text-[#5A0E12] hover:bg-[#EFE7DF] disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteMeasurement(
                        measurement.id
                      )
                    }
                    disabled={loading}
                    className="border border-[#E8B4B4] rounded-lg px-3 py-1.5 text-xs text-[#991B1B] hover:bg-[#FEF2F2] disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}