"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateProfile, updateOrganization, changePassword, updateVerification } from "./actions";
import type { SerializedInvoice } from "./page";

interface OrganizationData {
  name: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  timezone: string | null;
  business_hours_start: string | null;
  business_hours_end: string | null;
  business_days: number[] | null;
  country: string | null;
  legal_name: string | null;
  dba_name: string | null;
  ein: string | null;
  business_type: string | null;
  registration_number: string | null;
  business_industry: string | null;
  rep_full_name: string | null;
  rep_title: string | null;
  rep_email: string | null;
  rep_phone: string | null;
  rep_date_of_birth: string | null;
}

interface SettingsClientProps {
  profile: {
    full_name: string | null;
    email: string;
    organization_id: string | null;
  };
  organization: OrganizationData | null;
  billing: {
    stripe_customer_id: string | null;
    subscription_status: string | null;
    invoices: SerializedInvoice[];
  };
}

function ProfileTab({ profile }: { profile: SettingsClientProps["profile"] }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await updateProfile(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      toast.success("Profile updated.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="opacity-60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={profile.full_name ?? ""}
              placeholder="Jane Doe"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "America/Phoenix",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function OrganizationTab({
  organization,
}: {
  organization: SettingsClientProps["organization"];
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>(
    organization?.business_days ?? [1, 2, 3, 4, 5]
  );

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    formData.set("business_days", JSON.stringify(selectedDays));
    const result = await updateOrganization(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      toast.success("Organization updated.");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>
            Your brokerage or company information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization_name">Company name</Label>
              <Input
                id="organization_name"
                name="organization_name"
                type="text"
                defaultValue={organization?.name ?? ""}
                placeholder="Acme Mortgage"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org_phone">Phone</Label>
                <Input
                  id="org_phone"
                  name="org_phone"
                  type="tel"
                  defaultValue={organization?.phone ?? ""}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org_email">Email</Label>
                <Input
                  id="org_email"
                  name="org_email"
                  type="email"
                  defaultValue={organization?.email ?? ""}
                  placeholder="info@acmemortgage.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="org_website">Website</Label>
              <Input
                id="org_website"
                name="org_website"
                type="url"
                defaultValue={organization?.website ?? ""}
                placeholder="https://acmemortgage.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org_address">Address</Label>
              <Input
                id="org_address"
                name="org_address"
                type="text"
                defaultValue={organization?.address ?? ""}
                placeholder="123 Main St, Suite 100, City, State ZIP"
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-3">Business Hours</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org_timezone">Timezone</Label>
                  <select
                    id="org_timezone"
                    name="org_timezone"
                    defaultValue={organization?.timezone ?? "America/New_York"}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="org_hours_start">Opening time</Label>
                  <Input
                    id="org_hours_start"
                    name="org_hours_start"
                    type="time"
                    defaultValue={organization?.business_hours_start ?? "09:00"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org_hours_end">Closing time</Label>
                  <Input
                    id="org_hours_end"
                    name="org_hours_end"
                    type="time"
                    defaultValue={organization?.business_hours_end ?? "17:00"}
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label>Business days</Label>
                <div className="flex gap-1.5">
                  {DAY_LABELS.map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`h-8 w-10 rounded-md text-xs font-medium transition-colors ${
                        selectedDays.includes(i)
                          ? "bg-emerald text-background"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SecurityTab() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await changePassword(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      toast.success("Password updated.");
      const form = document.getElementById("security-form") as HTMLFormElement;
      form?.reset();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Update your password to keep your account secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="security-form" action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_password">New password</Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="Repeat your new password"
              required
              minLength={8}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const COUNTRY_CONFIG = {
  US: {
    label: "United States",
    taxIdLabel: "EIN (Employer Identification Number)",
    taxIdPlaceholder: "XX-XXXXXXX",
    taxIdHelp: "9-digit federal tax ID assigned by the IRS",
    regLabel: "State registration number",
    regPlaceholder: "State filing number",
    addressPlaceholder: "123 Main St, Suite 100, City, State ZIP",
    businessTypes: [
      "Sole Proprietorship",
      "LLC",
      "Partnership",
      "S-Corporation",
      "C-Corporation",
      "Non-Profit",
      "Other",
    ],
  },
  CA: {
    label: "Canada",
    taxIdLabel: "BN (Business Number)",
    taxIdPlaceholder: "123456789 RT0001",
    taxIdHelp: "9-digit CRA Business Number (with optional program account)",
    regLabel: "Provincial registration number",
    regPlaceholder: "Provincial/territorial filing number",
    addressPlaceholder: "123 Main St, Suite 100, City, Province Postal Code",
    businessTypes: [
      "Sole Proprietorship",
      "Partnership",
      "Corporation (federal)",
      "Corporation (provincial)",
      "Cooperative",
      "Non-Profit",
      "Other",
    ],
  },
} as const;

type CountryCode = keyof typeof COUNTRY_CONFIG;

const INDUSTRIES = [
  "Financial Services",
  "Insurance",
  "Real Estate",
  "Mortgage",
  "Banking",
  "Wealth Management",
  "Tax & Accounting",
  "Other",
];

function VerificationTab({
  organization,
}: {
  organization: SettingsClientProps["organization"];
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState<CountryCode>(
    (organization?.country as CountryCode) ?? "US"
  );

  const cc = COUNTRY_CONFIG[country];

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    formData.set("country", country);
    const result = await updateVerification(formData);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      toast.success("Verification details saved.");
    }
  }

  const filledFields = [
    organization?.legal_name,
    organization?.ein,
    organization?.business_type,
    organization?.address,
    organization?.website,
    organization?.rep_full_name,
    organization?.rep_email,
    organization?.rep_phone,
  ].filter(Boolean).length;
  const totalRequired = 8;
  const isComplete = filledFields === totalRequired;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Business Verification</CardTitle>
              <CardDescription>
                Required for phone number registration (Twilio A2P). Complete all fields to enable calling and SMS.
              </CardDescription>
            </div>
            <Badge variant={isComplete ? "default" : "outline"} className={isComplete ? "bg-emerald/15 text-emerald border-emerald/20" : ""}>
              {filledFields}/{totalRequired} complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {/* Country selector */}
            <div>
              <Label className="mb-2 block">Country of registration</Label>
              <div className="flex gap-2">
                {(Object.keys(COUNTRY_CONFIG) as CountryCode[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCountry(code)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      country === code
                        ? "bg-emerald text-background"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {COUNTRY_CONFIG[code].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Business Details */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-3">Business Details</h3>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="legal_name">
                      Legal business name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="legal_name"
                      name="legal_name"
                      type="text"
                      defaultValue={organization?.legal_name ?? ""}
                      placeholder="As registered with your government"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dba_name">
                      {country === "CA" ? "Operating / Trade name" : "DBA / Trade name"}
                    </Label>
                    <Input
                      id="dba_name"
                      name="dba_name"
                      type="text"
                      defaultValue={organization?.dba_name ?? ""}
                      placeholder="If different from legal name"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ein">
                      {cc.taxIdLabel} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="ein"
                      name="ein"
                      type="text"
                      defaultValue={organization?.ein ?? ""}
                      placeholder={cc.taxIdPlaceholder}
                      required
                    />
                    <p className="text-[11px] text-muted-foreground">{cc.taxIdHelp}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registration_number">{cc.regLabel}</Label>
                    <Input
                      id="registration_number"
                      name="registration_number"
                      type="text"
                      defaultValue={organization?.registration_number ?? ""}
                      placeholder={cc.regPlaceholder}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="business_type">
                      Business type <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="business_type"
                      name="business_type"
                      defaultValue={organization?.business_type ?? ""}
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="" disabled>Select type...</option>
                      {cc.businessTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_industry">Industry</Label>
                    <select
                      id="business_industry"
                      name="business_industry"
                      defaultValue={organization?.business_industry ?? "Financial Services"}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v_address">
                    Business address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="v_address"
                    name="v_address"
                    type="text"
                    defaultValue={organization?.address ?? ""}
                    placeholder={cc.addressPlaceholder}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v_website">
                    Website URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="v_website"
                    name="v_website"
                    type="url"
                    defaultValue={organization?.website ?? ""}
                    placeholder="https://yourbusiness.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Authorized Representative */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium mb-1">Authorized Representative</h3>
              <p className="text-xs text-muted-foreground mb-3">
                The person authorized to register on behalf of the business. Required for carrier identity verification.
              </p>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rep_full_name">
                      Full legal name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="rep_full_name"
                      name="rep_full_name"
                      type="text"
                      defaultValue={organization?.rep_full_name ?? ""}
                      placeholder="Jane Smith"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rep_title">Job title</Label>
                    <Input
                      id="rep_title"
                      name="rep_title"
                      type="text"
                      defaultValue={organization?.rep_title ?? ""}
                      placeholder="CEO, Owner, Compliance Officer..."
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rep_email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="rep_email"
                      name="rep_email"
                      type="email"
                      defaultValue={organization?.rep_email ?? ""}
                      placeholder="jane@company.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rep_phone">
                      Phone <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="rep_phone"
                      name="rep_phone"
                      type="tel"
                      defaultValue={organization?.rep_phone ?? ""}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rep_dob">Date of birth</Label>
                    <Input
                      id="rep_dob"
                      name="rep_dob"
                      type="date"
                      defaultValue={organization?.rep_date_of_birth ?? ""}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      May be required by Twilio for identity verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save verification details"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  trialing: { label: "Trialing", variant: "secondary" },
  past_due: { label: "Past due", variant: "destructive" },
  canceled: { label: "Canceled", variant: "outline" },
  unpaid: { label: "Unpaid", variant: "destructive" },
  incomplete: { label: "Incomplete", variant: "outline" },
  incomplete_expired: { label: "Expired", variant: "outline" },
  paused: { label: "Paused", variant: "secondary" },
};

const invoiceStatusConfig: Record<string, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  open: { label: "Open", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  void: { label: "Void", className: "bg-muted text-muted-foreground" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  uncollectible: { label: "Uncollectible", className: "bg-red-500/15 text-red-700 dark:text-red-400" },
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BillingTab({ billing }: { billing: SettingsClientProps["billing"] }) {
  const [loading, setLoading] = useState(false);

  async function handleManageBilling() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error ?? "Failed to open billing portal.");
        setLoading(false);
      }
    } catch {
      toast.error("Failed to open billing portal.");
      setLoading(false);
    }
  }

  const sub = billing.subscription_status;
  const subConfig = sub ? statusConfig[sub] : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Billing</CardTitle>
              <CardDescription>
                Manage your subscription and invoices.
              </CardDescription>
            </div>
            {subConfig && (
              <Badge variant={subConfig.variant}>{subConfig.label}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {!sub && (
            <p className="text-sm text-muted-foreground">
              No active subscription. Contact support to get started with a plan.
            </p>
          )}
          <Button onClick={handleManageBilling} disabled={loading}>
            {loading ? "Opening..." : "Manage billing"}
            {!loading && <ExternalLink className="ml-2 h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>

      {billing.invoices.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {billing.invoices.map((invoice) => {
                  const invStatus = invoice.status
                    ? invoiceStatusConfig[invoice.status]
                    : null;

                  return (
                    <TableRow key={invoice.number ?? invoice.date}>
                      <TableCell className="font-medium">
                        {invoice.number ?? "—"}
                      </TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>
                        {formatCurrency(invoice.amount_due, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        {invStatus ? (
                          <Badge
                            variant="outline"
                            className={invStatus.className}
                          >
                            {invStatus.label}
                          </Badge>
                        ) : (
                          invoice.status ?? "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {invoice.hosted_invoice_url && (
                          <a
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No invoices yet. Invoices will appear here once billing begins.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const VALID_TABS = ["profile", "organization", "security", "verification", "billing"];

export function SettingsClient({ defaultTab, profile, organization, billing }: SettingsClientProps & { defaultTab?: string }) {
  const initialTab = defaultTab && VALID_TABS.includes(defaultTab) ? defaultTab : "profile";
  return (
    <Tabs defaultValue={initialTab}>
      <TabsList variant="line">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="verification">Verification</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-6">
        <ProfileTab profile={profile} />
      </TabsContent>
      <TabsContent value="organization" className="mt-6">
        <OrganizationTab organization={organization} />
      </TabsContent>
      <TabsContent value="security" className="mt-6">
        <SecurityTab />
      </TabsContent>
      <TabsContent value="verification" className="mt-6">
        <VerificationTab organization={organization} />
      </TabsContent>
      <TabsContent value="billing" className="mt-6">
        <BillingTab billing={billing} />
      </TabsContent>
    </Tabs>
  );
}
