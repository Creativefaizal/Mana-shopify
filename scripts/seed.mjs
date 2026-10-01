#!/usr/bin/env node
/**
 * Mana :: catalogue seeder
 *
 *   npm run seed
 *
 * Reads data/catalog.json (the same file the storefront falls back to) and
 * upserts the categories + products into Supabase using the service-role key.
 * Idempotent: run it as often as you like, prices and copy stay in sync.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

function loadEnvFile(file) {
  try {
    const raw = readFileSync(file, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!match) continue;
      const [, key, rawValue] = match;
      const value = rawValue.replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* .env.local is optional - real env vars win */
  }
}

loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    [
      "Missing Supabase credentials.",
      "",
      "Create .env.local from .env.local.example and set:",
      "  NEXT_PUBLIC_SUPABASE_URL       (Supabase -> Project Settings -> API -> Project URL)",
      "  SUPABASE_SERVICE_ROLE_KEY      (Supabase -> Project Settings -> API -> service_role secret)",
      "",
      "Then run `npm run seed` again.",
    ].join("\n"),
  );
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(path.join(root, "data", "catalog.json"), "utf8"));
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const now = Date.now();

const products = catalog.products.map((product, index) => ({
  slug: product.slug,
  name: product.name,
  description: product.description,
  category: product.category,
  category_name:
    catalog.categories.find((category) => category.slug === product.category)?.name ?? "Other",
  price: product.price,
  compare_at_price: product.compare_at_price,
  rating: product.rating,
  reviews_count: product.reviews_count,
  image_url: product.image_url,
  stock: product.stock,
  is_new: product.is_new,
  is_best_seller: product.is_best_seller,
  sort_index: product.sort_index ?? index + 1,
  // Stagger creation dates so "Latest first" sorting is meaningful.
  created_at: new Date(now - index * 3_600_000).toISOString(),
}));

async function main() {
  console.log(`Seeding ${catalog.categories.length} categories and ${products.length} products...`);

  const { error: categoryError } = await supabase
    .from("categories")
    .upsert(catalog.categories, { onConflict: "slug" });

  if (categoryError) {
    console.error("Category upsert failed:", categoryError.message);
    if (categoryError.code === "42P01") {
      console.error("Run supabase/schema.sql in the Supabase SQL editor first.");
    }
    process.exit(1);
  }

  const { error: productError } = await supabase
    .from("products")
    .upsert(products, { onConflict: "slug" });

  if (productError) {
    console.error("Product upsert failed:", productError.message);
    process.exit(1);
  }

  const { count } = await supabase
    .from("products")
    .select("slug", { count: "exact", head: true });

  console.log(`Done. Supabase now holds ${count ?? products.length} products.`);
  console.log("Restart `npm run dev` - the storefront reports its source as Supabase.");
}

main().catch((error) => {
  console.error("Unexpected seeding failure:", error);
  process.exit(1);
});
