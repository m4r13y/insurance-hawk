"use client";
"use client";
import { useState } from "react";
import axios from "axios";

export default function TestQuotes() {
  const [form, setForm] = useState({
    zip5: "",
    age: "",
    gender: "M",
    tobacco: 0,
    plan: "A",
    paymentMode: "month",
    applyDiscounts: true
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailsIdx, setDetailsIdx] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await axios.post(
        "/api/test-quotes",
        { ...form, age: Number(form.age), tobacco: Number(form.tobacco) }
      );
      setResult(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8 border">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">Test Quotes</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Apply Discounts</label>
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.applyDiscounts ? "bg-blue-600" : "bg-gray-300"}`}
              onClick={() => setForm(f => ({ ...f, applyDiscounts: !f.applyDiscounts }))}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${form.applyDiscounts ? "translate-x-5" : "translate-x-1"}`}></span>
            </button>
            <span className="text-xs text-gray-500">{form.applyDiscounts ? "On" : "Off"}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            <input
              name="zip5"
              value={form.zip5}
              onChange={handleChange}
              placeholder="ZIP Code"
              className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              name="age"
              type="number"
              value={form.age}
              onChange={handleChange}
              placeholder="Age"
              className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tobacco Use</label>
            <select
              name="tobacco"
              value={form.tobacco}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Non-Tobacco</option>
              <option value={1}>Tobacco</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <select
              name="plan"
              value={form.plan}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
            >
              <option value="A">A</option>
              <option value="G">G</option>
              <option value="N">N</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <select
              name="paymentMode"
              value={form.paymentMode}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-500"
            >
              <option value="month">Monthly</option>
              <option value="annual">Annual</option>
              <option value="quarter">Quarter</option>
              <option value="semi_annual">Semi-Annual</option>
            </select>
          </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow"
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Quote"}
        </button>
      </form>
      {error && <div className="text-red-600 mt-4 font-semibold">{error}</div>}
      {result && Array.isArray(result.result) && (
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">Quote Results</h2>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border px-3 py-2">Name</th>
                    <th className="border px-3 py-2">{form.paymentMode.charAt(0).toUpperCase() + form.paymentMode.slice(1)}</th>
                    <th className="border px-3 py-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {result.result.map((q: any, idx: number) => {
                    let rateCents = q.rate?.[form.paymentMode];
                    // Apply discount if enabled and available
                    if (form.applyDiscounts && Array.isArray(q.discounts) && q.discounts.length > 0) {
                      const discount = q.discounts.reduce((acc: number, d: any) => {
                        if (d.type === "percent") {
                          return acc * (1 - d.value);
                        }
                        return acc;
                      }, rateCents ?? 0);
                      rateCents = discount;
                    }
                    const rateDollars = typeof rateCents === "number" ? `$${(rateCents / 100).toFixed(2)}` : "";
                    return (
                      <tr key={idx} className="border-b hover:bg-blue-50">
                        <td className="border px-3 py-2 font-semibold text-blue-700">{q.company_base?.name ?? ""}</td>
                        <td className="border px-3 py-2 font-bold text-green-700">{rateDollars}</td>
                        <td className="border px-3 py-2">
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold shadow"
                            onClick={() => setDetailsIdx(idx)}
                          >Details</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Details Popup */}
            {detailsIdx !== null && result.result[detailsIdx] && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setDetailsIdx(null)}
                  >✕</button>
                  <h3 className="text-lg font-bold mb-2 text-blue-700">{result.result[detailsIdx].company_base?.name ?? ""}</h3>
                  <div className="mb-2 text-sm text-gray-700">
                    <strong>Plan:</strong> {result.result[detailsIdx].plan}<br />
                    <strong>Rating Class:</strong> {result.result[detailsIdx].rating_class}<br />
                    <strong>Effective Date:</strong> {result.result[detailsIdx].effective_date}<br />
                    <strong>Expires Date:</strong> {result.result[detailsIdx].expires_date}<br />
                    <strong>Gender:</strong> {result.result[detailsIdx].gender}<br />
                    <strong>Tobacco:</strong> {result.result[detailsIdx].tobacco ? "Yes" : "No"}<br />
                    <strong>Discounts:</strong> {Array.isArray(result.result[detailsIdx].discounts) && result.result[detailsIdx].discounts.length > 0 ? (
                      result.result[detailsIdx].discounts.map((d: any, i: number) => (
                        <span key={i} className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-1 mr-1 mb-1 text-xs">
                          {d.name} ({d.type}): {d.value}
                        </span>
                      ))
                    ) : "None"}
                  </div>
                  <div className="text-xs text-gray-500">
                    <strong>Company Info:</strong><br />
                    {result.result[detailsIdx].company_base?.name_full}<br />
                    <strong>AM Best Rating:</strong> {result.result[detailsIdx].company_base?.ambest_rating}<br />
                    <strong>Business Type:</strong> {result.result[detailsIdx].company_base?.business_type}<br />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
