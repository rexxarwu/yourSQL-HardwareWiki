"use client";
import Link from "next/link";

export default function HomePage() {
  const tables = [
    { name: "CPU", desc: "Explore processors, cores, and performance." },
    { name: "GPU", desc: "Compare graphics cards and power usage." },
    { name: "Laptop", desc: "Browse laptop models and specs." },
    { name: "Mobile", desc: "Discover mobile devices and cameras." },
  ];

  return (
    <div>
      <h2>Explore Hardware Categories</h2>
      <div className="grid">
        {tables.map((t) => (
          <Link key={t.name} href={`/${t.name.toLowerCase()}`}>
            <div className="card">
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
