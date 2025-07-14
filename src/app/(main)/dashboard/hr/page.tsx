"use client";

import React, { useEffect, useState } from "react";

interface Leave {
  id: number;
  user_id: string;
  start_date: string;
  end_date: string;
  type: string;
  status: string;
  substitute_user_id?: string;
}

export default function HRPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    user_id: "",
    start_date: "",
    end_date: "",
    type: "",
    substitute_user_id: "",
  });

  const fetchLeaves = async () => {
    setLoading(true);
    const res = await fetch("/api/hr-leaves");
    const data = await res.json();
    setLeaves(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/hr-leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert("İzin talebi oluşturulamadı!");
    } else {
      alert("İzin talebi başarıyla oluşturuldu.");
      setForm({
        user_id: "",
        start_date: "",
        end_date: "",
        type: "",
        substitute_user_id: "",
      });
      fetchLeaves();
    }

    setLoading(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">HR İzin Talepleri</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 bg-white shadow-md rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6"
      >
        <input
          type="text"
          name="user_id"
          placeholder="Kullanıcı ID (UUID)"
          value={form.user_id}
          onChange={handleChange}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">İzin Türü Seçin</option>
          <option value="annual">Yıllık İzin</option>
          <option value="sick">Hastalık İzni</option>
          <option value="other">Diğer</option>
        </select>
        <input
          type="text"
          name="substitute_user_id"
          placeholder="Yerine Bakar Kişi ID (UUID)"
          value={form.substitute_user_id}
          onChange={handleChange}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-2 md:col-span-1 bg-blue-600 text-white font-semibold px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Kaydediliyor..." : "İzin Talebi Gönder"}
        </button>
      </form>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 border-b border-gray-200">ID</th>
              <th className="p-4 border-b border-gray-200">Kullanıcı ID</th>
              <th className="p-4 border-b border-gray-200">Başlangıç</th>
              <th className="p-4 border-b border-gray-200">Bitiş</th>
              <th className="p-4 border-b border-gray-200">Tür</th>
              <th className="p-4 border-b border-gray-200">Durum</th>
              <th className="p-4 border-b border-gray-200">Yerine Bakar Kişi ID</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id} className="hover:bg-gray-50">
                <td className="p-4 border-b border-gray-200">{leave.id}</td>
                <td className="p-4 border-b border-gray-200">{leave.user_id}</td>
                <td className="p-4 border-b border-gray-200">{leave.start_date}</td>
                <td className="p-4 border-b border-gray-200">{leave.end_date}</td>
                <td className="p-4 border-b border-gray-200 capitalize">{leave.type}</td>
                <td className="p-4 border-b border-gray-200 capitalize">{leave.status}</td>
                <td className="p-4 border-b border-gray-200">{leave.substitute_user_id || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
