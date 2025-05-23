// /app/layout.js
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";


export const metadata = {
  title: "TravelGo",
  description: "Your Travel Partner",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        <Navbar />
        <main style={{ minHeight: '90vh' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
