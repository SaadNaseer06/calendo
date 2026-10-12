"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { BrandForm } from "@/components/brands/brand-form";
import { Button } from "@/components/ui/button";
import { useBrand } from "@/components/brand-provider";
import type { Brand } from "@/types";

export default function BrandSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { refreshBrands } = useBrand();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/brands/${params.id}`);
        const json = (await res.json()) as { data: Brand | null; error?: string };
        if (!res.ok || !json.data) {
          setNotFound(true);
          return;
        }
        setBrand(json.data);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.id]);

  const update = async (data: {
    name: string;
    niche: string;
    description?: string;
    brandVoice?: string;
    logoUrl?: string;
    websiteUrl?: string;
    ga4MeasurementId?: string;
    ga4PropertyId?: string;
    contentPillars: string[];
    platforms: string[];
  }) => {
    const res = await fetch(`/api/brands/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as { data: Brand | null; error: string | null };
    if (json.error) toast.error(json.error);
    else {
      toast.success("Brand updated");
      if (json.data) setBrand(json.data);
      await refreshBrands();
    }
  };

  const remove = async () => {
    if (!confirm("Delete this brand and all posts?")) return;
    const res = await fetch(`/api/brands/${params.id}`, { method: "DELETE" });
    const json = (await res.json()) as { error: string | null };
    if (json.error) {
      toast.error(json.error);
      return;
    }
    toast.success("Brand deleted");
    await refreshBrands();
    router.push("/brands");
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <Topbar title="Brand Settings" />
        <p className="p-6 text-[var(--text-secondary)]">Loading...</p>
      </div>
    );
  }

  if (notFound || !brand) {
    return (
      <div className="flex flex-1 flex-col">
        <Topbar title="Brand Settings" />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-[var(--text-secondary)]">Brand not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Topbar title={`${brand.name} Settings`} />
      <div className="mx-auto w-full max-w-lg space-y-6 p-6">
        <BrandForm initial={brand} onSubmit={update} />
        <Button variant="destructive" onClick={remove}>
          Delete Brand
        </Button>
      </div>
    </div>
  );
}
