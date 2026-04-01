import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/app/lib/wordpress-api";
import { Product } from "@/app/types/product";
import { unstable_cache } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CachedProduct {
  id: number;
  name: string;
  slug: string;
  image: string;
}

// Data Fetch hiper-optimizado para Serverless (Vercel)
// Cache persistente durante 1 hora (3600 segundos) para no saturar al hosting de WP
const getSearchIndex = unstable_cache(
  async (): Promise<CachedProduct[]> => {
    try {
      const res = await getProducts(1, 100, {});
      const products: Product[] = res.products;
      
      return products.map(p => {
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
    } catch (e) {
      console.error("Error building search index", e);
      return [];
    }
  },
  ['global-search-index'],
  { revalidate: 3600 } // 1 hora de caché absoluto
);

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
      // Comparar contra el prefijo exacto y un caracter más por si el usuario se comió una letra
      const dist1 = levenshtein(qw, tw.substring(0, qw.length));
      const dist2 = levenshtein(qw, tw.substring(0, qw.length + 1));
      const dist = Math.min(dist1, dist2);
      
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

    // Mayor tolerancia al error (2 errores incluso en palabras de 4 letras)
    // Esto asegura que "lgth" haga match correcto con "Lightweight".
    const MAX_TOLERANCE_SCORE = Math.max(2, Math.floor(q.trim().length / 2));

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
