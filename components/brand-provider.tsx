"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Brand } from "@/types";

interface BrandContextValue {
  brands: Brand[];
  activeBrand: Brand | null;
  setActiveBrandId: (id: string) => void;
  refreshBrands: () => Promise<void>;
  loading: boolean;
}

const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBrands = useCallback(async () => {
    try {
      const res = await fetch("/api/brands");
      if (res.status === 401) {
        setBrands([]);
        return;
      }
      const json = (await res.json()) as { data: Brand[] | null; error: string | null };
      if (json.data) {
        setBrands(json.data);
        setActiveBrandId((current) => {
          const list = json.data!;
          if (list.length === 0) {
            localStorage.removeItem("calendo-active-brand");
            return null;
          }
          if (current && list.some((b) => b.id === current)) return current;
          const stored = localStorage.getItem("calendo-active-brand");
          const found = list.find((b) => b.id === stored);
          return found?.id ?? list[0].id;
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshBrands();
  }, [refreshBrands]);

  const setActiveBrandIdPersist = useCallback((id: string) => {
    setActiveBrandId(id);
    localStorage.setItem("calendo-active-brand", id);
  }, []);

  const activeBrand = useMemo(
    () => brands.find((b) => b.id === activeBrandId) ?? null,
    [brands, activeBrandId]
  );

  return (
    <BrandContext.Provider
      value={{
        brands,
        activeBrand,
        setActiveBrandId: setActiveBrandIdPersist,
        refreshBrands,
        loading,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within BrandProvider");
  return ctx;
}
