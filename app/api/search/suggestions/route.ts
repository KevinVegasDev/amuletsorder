import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/app/lib/wordpress-api";
import { Product } from "@/app/types/product";

export const runtime = "nodejs";

interface CachedProduct {
  id: number;
  name: string;
  slug: string;
  image: string;
}

// Global cache
let _cachedProducts: CachedProduct[] | null = null;
let _lastCacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000;

async function getSearchIndex(): Promise<CachedProduct[]> {
  const now = Date.now();
  if (_cachedProducts && (now - _lastCacheTime) < CACHE_TTL) {
    return _cachedProducts;
  }

  try {
    const res = await getProducts(1, 100, {});
    const products: Product[] = res.products;
    
    _cachedProducts = products.map(p => {
      let imageUrl = "/placeholder-image.jpg";
      if (p.images && p.images.length > 0) {
        imageUrl = p.images[0].src;
        if (imageUrl.includes("-150x150") || imageUrl.includes("-300x300")) {
          imageUrl = imageUrl.replace(/-\d+x\d+/, "");
        }
      }
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: imageUrl
      };
    });
    
    _lastCacheTime = now;
    return _cachedProducts;
  } catch (e) {
    console.error("Error building search index", e);
    return _cachedProducts || [];
  }
}

// Distancia Levenshtein para calcular qué tan parecidas son dos palabras
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) { matrix[0][i] = i; }
  for (let j = 0; j <= b.length; j += 1) { matrix[j][0] = j; }
  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  return matrix[b.length][a.length];
}

// Busca subcadenas aproximadas
function fuzzyMatch(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return 0; // Mucha similitud si viene exacta
  
  // Dividir en palabras y calcular similitudes
  const qWords = q.split(" ");
  const tWords = t.split(" ");
  let totalScore = 0;
  
  for (const qw of qWords) {
    let bestDist = 1000;
    for (const tw of tWords) {
      const dist = levenshtein(qw, tw);
      if (dist < bestDist) bestDist = dist;
    }
    totalScore += bestDist;
  }
  return totalScore;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q.trim() || q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const index = await getSearchIndex();

    // Búsqueda aproximada "fuzzy" sin dependencias
    const MAX_TOLERANCE_SCORE = q.length <= 4 ? 1 : 2; // tolerar 1 o 2 typos

    const results = index
      .map(item => {
        const score = fuzzyMatch(q, item.name);
        return { item, score };
      })
      .filter(r => r.score <= Math.max(MAX_TOLERANCE_SCORE, (q.trim().split(" ").length))) // Filtramos por puntaje ("distancia")
      .sort((a, b) => a.score - b.score);
    
    // Devolvemos el top 5
    const suggestions = results.slice(0, 5).map(r => r.item);

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("Search API Error:", err);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
