"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { BrandCard } from "@/components/brands/brand-card";
import { BrandForm } from "@/components/brands/brand-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBrand } from "@/components/brand-provider";

export default function BrandsPage() {
  const { brands, refreshBrands, loading } = useBrand();
  const [open, setOpen] = useState(false);

  const createBrand = async (data: {
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
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as { error: string | null };
    if (json.error) toast.error(json.error);
    else {
      toast.success("Brand created");
      setOpen(false);
      await refreshBrands();
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Topbar title="Brands">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="mr-1 h-4 w-4" /> New Brand
          </DialogTrigger>
          <DialogContent className="border-[var(--cal-border)] bg-[var(--bg-surface)] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Create Brand</DialogTitle>
            </DialogHeader>
            <BrandForm onSubmit={createBrand} submitLabel="Create Brand" />
          </DialogContent>
        </Dialog>
      </Topbar>
      <div className="p-6">
        {loading ? (
          <p className="text-[var(--text-secondary)]">Loading...</p>
        ) : brands.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--cal-border)] p-12 text-center">
            <p className="text-[var(--text-secondary)]">No brands yet. Create one to start planning content.</p>
            <Button className="mt-4" onClick={() => setOpen(true)}>
              Create Brand
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((b) => (
              <BrandCard key={b.id} brand={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
