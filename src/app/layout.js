import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GuideAuthProvider } from "@/context/GuideAuthContext";
import { WishlistProvider } from "@/context/WishlistContext";

export const metadata = {
  title: "Ride Lanka - Trip Planner",
  description: "Plan trips within Sri Lanka with Ride Lanka.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <GuideAuthProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </GuideAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

