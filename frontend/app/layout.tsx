import "./globals.css";

export const metadata = {
  title: "Hardware Wiki",
  description: "A wiki of CPUs, GPUs, Laptops, and Mobiles connected to GCP MySQL",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="navbar">
          <h1>⚙️ Hardware Wiki</h1>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
