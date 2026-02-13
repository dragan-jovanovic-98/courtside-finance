"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { importContacts } from "../actions";

type ParsedRow = {
  first_name: string;
  last_name?: string;
  phone?: string;
  email?: string;
  company?: string;
  tags?: string;
};

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });

    if (row.first_name) {
      rows.push({
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone,
        email: row.email,
        company: row.company,
        tags: row.tags,
      });
    }
  }

  return rows;
}

export default function ImportLeadsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ count: number } | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setError("No valid rows found. Make sure your CSV has a 'first_name' column header.");
        setRows([]);
      } else {
        setRows(parsed);
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    setLoading(true);
    setError(null);
    const res = await importContacts(rows);
    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setResult({ count: res.count });
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/leads">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Import Contacts</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription>
            Upload a CSV file with columns: first_name, last_name, phone, email, company, tags.
            Only first_name is required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="w-full h-24 border-dashed"
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="size-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {fileName ?? "Click to select CSV file"}
              </span>
            </div>
          </Button>

          {rows.length > 0 && !result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="size-4 text-muted-foreground" />
                <span>{rows.length} contacts ready to import</span>
              </div>
              {/* Preview first 5 rows */}
              <div className="rounded border p-3 text-xs max-h-48 overflow-y-auto space-y-1">
                {rows.slice(0, 5).map((row, i) => (
                  <div key={i} className="text-muted-foreground">
                    {row.first_name} {row.last_name ?? ""}{row.phone ? ` · ${row.phone}` : ""}{row.email ? ` · ${row.email}` : ""}
                  </div>
                ))}
                {rows.length > 5 && (
                  <div className="text-muted-foreground">...and {rows.length - 5} more</div>
                )}
              </div>
              <Button onClick={handleImport} disabled={loading}>
                {loading ? "Importing..." : `Import ${rows.length} contacts`}
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <p className="text-sm text-green-600">
                Successfully imported {result.count} contacts.
              </p>
              <Button onClick={() => router.push("/leads")}>View Contacts</Button>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
