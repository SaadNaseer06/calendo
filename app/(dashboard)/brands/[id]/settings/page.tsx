"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { BrandForm } from "@/components/brands/brand-form";
import { Button } from "@/components/ui/button";
import type { Brand } from "@/types";

export default function BrandSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/brands/${params.id}`);
      const json = (await res.json()) as { data: Brand | null };
      if (json.data) setBrand(json.data);
    };
    void load();
  }, [params.id]);

  const update = async (data: {
    name: string;
    niche: string;
    description?: string;
    brandVoice?: string;
    contentPillars: string[];
    platforms: string[];
  }) => {
    const res = await fetch(`/api/brands/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as { error: string | null };
    if (json.error) toast.error(json.error);
    else toast.success("Brand updated");
  };

  const remove = async () => {
    if (!confirm("Delete this brand and all posts?")) return;
    await fetch(`/api/brands/${params.id}`, { method: "DELETE" });
    toast.success("Brand deleted");
    router.push("/brands");
  };

  if (!brand) {
    return (
      <div className="flex flex-1 flex-col">
        <Topbar title="Brand Settings" />
        <p className="p-6 text-[var(--text-secondary)]">Loading...</p>
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
