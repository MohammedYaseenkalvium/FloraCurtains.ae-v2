"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type StaffFormProps = {
  mode: "create" | "edit";

  staffId?: string;

  initialValues?: {
    name: string;
    email: string;
    role: string;
  };
};

export function StaffForm({
  mode,
  staffId,
  initialValues,
}: StaffFormProps) {
  const router = useRouter();

  const [name, setName] = useState(
    initialValues?.name ?? ""
  );

  const [email, setEmail] = useState(
    initialValues?.email ?? ""
  );

  const [role, setRole] = useState(
    initialValues?.role ?? "STAFF"
  );

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (mode === "create" && password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (
      mode === "edit" &&
      password &&
      password.length < 8
    ) {
      setError(
        "If changing the password, it must be at least 8 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "create"
          ? "/api/staff"
          : `/api/staff/${staffId}`;

      const method =
        mode === "create"
          ? "POST"
          : "PATCH";

      const payload: {
        name: string;
        email: string;
        role: string;
        password?: string;
      } = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
      };

      if (password.trim()) {
        payload.password =
          password.trim();
      }

      const response = await fetch(
        endpoint,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "Something went wrong. Please try again."
        );
      }

      setSuccess(
        mode === "create"
          ? "Staff account created successfully."
          : "Staff account updated successfully."
      );

      setTimeout(() => {
        router.push("/staff");
        router.refresh();
      }, 600);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Account Details */}
      <section className="rounded-xl border border-[#D8C9BC] bg-white p-5">
        <div className="mb-5 flex items-center gap-2">
          <UserRound
            size={17}
            className="text-[#5A0E12]"
          />

          <div>
            <h2 className="text-sm font-semibold text-[#5A0E12]">
              Account Details
            </h2>

            <p className="mt-1 text-xs text-[#6B625A]">
              Basic information for the staff account.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Name */}
          <div>
            <label
              htmlFor="staff-name"
              className="mb-2 block text-xs font-semibold text-[#1E1B18]"
            >
              Full Name
            </label>

            <input
              id="staff-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter full name"
              autoComplete="name"
              disabled={loading}
              className="h-11 w-full rounded-lg border border-[#D8C9BC] bg-white px-3 text-sm text-[#1E1B18] outline-none transition placeholder:text-[#A69A91] focus:border-[#5A0E12] focus:ring-1 focus:ring-[#5A0E12] disabled:cursor-not-allowed disabled:bg-[#F8F5F2]"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="staff-email"
              className="mb-2 block text-xs font-semibold text-[#1E1B18]"
            >
              Email Address
            </label>

            <input
              id="staff-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="staff@example.com"
              autoComplete="email"
              disabled={loading}
              className="h-11 w-full rounded-lg border border-[#D8C9BC] bg-white px-3 text-sm text-[#1E1B18] outline-none transition placeholder:text-[#A69A91] focus:border-[#5A0E12] focus:ring-1 focus:ring-[#5A0E12] disabled:cursor-not-allowed disabled:bg-[#F8F5F2]"
            />
          </div>
        </div>
      </section>

      {/* Access */}
      <section className="rounded-xl border border-[#D8C9BC] bg-white p-5">
        <div className="mb-5 flex items-center gap-2">
          <ShieldCheck
            size={17}
            className="text-[#5A0E12]"
          />

          <div>
            <h2 className="text-sm font-semibold text-[#5A0E12]">
              Access & Security
            </h2>

            <p className="mt-1 text-xs text-[#6B625A]">
              Control what level of access this account has.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Role */}
          <div>
            <label
              htmlFor="staff-role"
              className="mb-2 block text-xs font-semibold text-[#1E1B18]"
            >
              Role
            </label>

            <select
              id="staff-role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value)
              }
              disabled={loading}
              className="h-11 w-full rounded-lg border border-[#D8C9BC] bg-white px-3 text-sm text-[#1E1B18] outline-none transition focus:border-[#5A0E12] focus:ring-1 focus:ring-[#5A0E12] disabled:cursor-not-allowed disabled:bg-[#F8F5F2]"
            >
              <option value="STAFF">
                Staff
              </option>

              <option value="ADMIN">
                Administrator
              </option>

              {initialValues?.role &&
                ![
                  "STAFF",
                  "ADMIN",
                ].includes(
                  initialValues.role
                ) && (
                  <option
                    value={
                      initialValues.role
                    }
                  >
                    {initialValues.role}
                  </option>
                )}
            </select>

            <p className="mt-2 text-xs leading-5 text-[#6B625A]">
              Administrators can manage staff accounts.
              Staff users cannot access staff management.
            </p>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="staff-password"
              className="mb-2 block text-xs font-semibold text-[#1E1B18]"
            >
              {mode === "create"
                ? "Password"
                : "New Password"}
            </label>

            <div className="relative">
              <input
                id="staff-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder={
                  mode === "create"
                    ? "Minimum 8 characters"
                    : "Leave blank to keep current password"
                }
                autoComplete={
                  mode === "create"
                    ? "new-password"
                    : "new-password"
                }
                disabled={loading}
                className="h-11 w-full rounded-lg border border-[#D8C9BC] bg-white px-3 pr-11 text-sm text-[#1E1B18] outline-none transition placeholder:text-[#A69A91] focus:border-[#5A0E12] focus:ring-1 focus:ring-[#5A0E12] disabled:cursor-not-allowed disabled:bg-[#F8F5F2]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B625A] hover:text-[#5A0E12]"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>

            <p className="mt-2 text-xs leading-5 text-[#6B625A]">
              {mode === "create"
                ? "The password will be securely hashed before being stored."
                : "Only enter a password if you want to change it."}
            </p>
          </div>
        </div>
      </section>

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-[#D8C9BC] bg-white p-4">
          <AlertCircle
            size={17}
            className="mt-0.5 shrink-0 text-[#5A0E12]"
          />

          <p className="text-sm text-[#5A0E12]">
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-lg border border-[#D8C9BC] bg-white p-4">
          <CheckCircle2
            size={17}
            className="mt-0.5 shrink-0 text-[#5A0E12]"
          />

          <p className="text-sm text-[#5A0E12]">
            {success}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push("/staff")
          }
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-[#D8C9BC] bg-white px-5 text-sm font-semibold text-[#6B625A] transition-colors hover:bg-[#F8F5F2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#5A0E12] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#74171C] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2
                size={16}
                className="animate-spin"
              />

              Saving...
            </>
          ) : (
            <>
              <Save size={16} />

              {mode === "create"
                ? "Create Staff"
                : "Save Changes"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}