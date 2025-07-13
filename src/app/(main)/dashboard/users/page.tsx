"use client";
import React, { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard"; // AuthGuard component'in yolunu kendine göre ayarla

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

function UsersPageContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ id: "", name: "", email: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  // Sayfa açılır açılmaz kullanıcıları yükle
  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const method = editing ? "PUT" : "POST";
    const url = "/api/users";
    const body = editing
      ? { ...form, id: Number(form.id) }
      : { ...form, id: undefined };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Hata oluştu");
      setLoading(false);
      return;
    }

    setForm({ id: "", name: "", email: "", role: "" });
    setEditing(false);
    await fetchUsers();
    setLoading(false);
  };

  const handleEdit = (user: User) => {
    setForm({
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu kullanıcıyı silmek istediğine emin misin?")) return;

    setLoading(true);
    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Silme işlemi başarısız.");
      setLoading(false);
      return;
    }

    await fetchUsers();
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Kullanıcılar</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          name="name"
          placeholder="İsim"
          value={form.name}
          onChange={handleChange}
          className="border px-3 py-2 w-full"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="E-posta"
          value={form.email}
          onChange={handleChange}
          className="border px-3 py-2 w-full"
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="border px-3 py-2 w-full"
          required
        >
          <option value="">Rol seçin</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Kaydediliyor..." : editing ? "Güncelle" : "Kaydet"}
        </button>

        {editing && (
          <button
            type="button"
            onClick={() => {
              setForm({ id: "", name: "", email: "", role: "" });
              setEditing(false);
              setError(null);
            }}
            className="ml-4 bg-gray-600 text-white px-4 py-2 rounded"
          >
            İptal
          </button>
        )}

        {error && <div className="text-red-600">{error}</div>}
      </form>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">ID</th>
            <th className="border border-gray-300 p-2">İsim</th>
            <th className="border border-gray-300 p-2">E-posta</th>
            <th className="border border-gray-300 p-2">Rol</th>
            <th className="border border-gray-300 p-2">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border border-gray-300 p-2">{u.id}</td>
              <td className="border border-gray-300 p-2">{u.name}</td>
              <td className="border border-gray-300 p-2">{u.email}</td>
              <td className="border border-gray-300 p-2">{u.role}</td>
              <td className="border border-gray-300 p-2 space-x-2">
                <button
                  onClick={() => handleEdit(u)}
                  className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="bg-red-600 px-2 py-1 rounded text-white hover:bg-red-700"
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AuthGuard>
      <UsersPageContent />
    </AuthGuard>
  );
}
