"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMedicareAdvantageQuotes } from "@/lib/actions/advantage-quotes";
import { Copy, Check } from "lucide-react";

export default function MedicareAdvantageTest() {
  const [zipCode, setZipCode] = useState("68154"); // Default test zip
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTest = async () => {
    if (!zipCode || zipCode.length !== 5) {
      setError("Please enter a valid 5-digit ZIP code");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      console.log("🧪 Testing Medicare Advantage quotes for ZIP:", zipCode);
      const response = await getMedicareAdvantageQuotes({ zipCode });
      console.log("🧪 Test response:", response);
      setResult(response);
    } catch (err) {
      console.error("🧪 Test error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!result) return;
    
    try {
      const jsonString = JSON.stringify(result, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Medicare Advantage API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="ZIP Code (e.g., 68154)"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              maxLength={5}
              className="max-w-xs"
            />
            <Button onClick={handleTest} disabled={loading}>
              {loading ? "Testing..." : "Test API"}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800"><strong>Error:</strong> {error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-green-800">
                    <strong>Success!</strong> API response received.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Response
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border rounded-lg">
                <h3 className="font-semibold mb-2">Response Summary:</h3>
                <ul className="text-sm space-y-1">
                  <li><strong>Quotes Count:</strong> {result.quotes?.length || 0}</li>
                  <li><strong>Has Error:</strong> {result.error ? "Yes" : "No"}</li>
                  {result.error && <li><strong>Error Message:</strong> {result.error}</li>}
                </ul>
              </div>

              <div className="p-4 bg-gray-50 border rounded-lg">
                <h3 className="font-semibold mb-2">Sample Quote (First Result):</h3>
                {result.quotes && result.quotes.length > 0 ? (
                  <div className="text-sm space-y-1">
                    <p><strong>Plan Name:</strong> {result.quotes[0].plan_name || "N/A"}</p>
                    <p><strong>Organization:</strong> {result.quotes[0].organization_name || "N/A"}</p>
                    <p><strong>Monthly Rate:</strong> ${result.quotes[0].month_rate || "N/A"}</p>
                    <p><strong>Plan Type:</strong> {result.quotes[0].plan_type || "N/A"}</p>
                    <p><strong>Star Rating:</strong> {result.quotes[0].overall_star_rating || "N/A"}</p>
                    <p><strong>State:</strong> {result.quotes[0].state || "N/A"}</p>
                    <p><strong>County:</strong> {result.quotes[0].county || "N/A"}</p>
                  </div>
                ) : (
                  <p className="text-gray-600">No quotes available</p>
                )}
              </div>

              <details className="p-4 bg-gray-50 border rounded-lg">
                <summary className="font-semibold cursor-pointer">
                  Full API Response (Click to expand)
                </summary>
                <pre className="mt-2 text-xs overflow-auto max-h-96 bg-white p-3 border rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
