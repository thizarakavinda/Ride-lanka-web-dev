"use client";

import { createContext, useContext, useState, useCallback } from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    // Persist across reloads using localStorage
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ride_lanka_wishlist");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const saveToStorage = (items) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ride_lanka_wishlist", JSON.stringify(items));
    }
  };

  const addToWishlist = useCallback((place) => {
    setWishlist((prev) => {
      const key = place.name || place.title;
      if (prev.find((p) => (p.name || p.title) === key)) return prev; // already added
      const updated = [{ ...place, wishlistedAt: Date.now() }, ...prev];
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const removeFromWishlist = useCallback((placeKey) => {
    setWishlist((prev) => {
      const updated = prev.filter((p) => (p.name || p.title) !== placeKey);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const isWishlisted = useCallback(
    (place) => {
      const key = place?.name || place?.title;
      return !!wishlist.find((p) => (p.name || p.title) === key);
    },
    [wishlist]
  );

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
