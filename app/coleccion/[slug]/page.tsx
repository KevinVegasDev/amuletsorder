import { redirect } from "next/navigation";

// Esta ruta (/coleccion/[slug]) estaba sin uso. Redirige al market.
export default function ColeccionPage() {
  redirect("/market");
}
