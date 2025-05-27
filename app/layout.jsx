// /app/layout.js
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/richtexteditor.css"


export const metadata = {
  title: "TravelGo",
  description: "Your Travel Partner",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* richtextedit */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.core.css" />
        <link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" rel="stylesheet" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css"/>
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />


      </head>
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
