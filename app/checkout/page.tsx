import { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | Amulets Order",
  description: "Complete your purchase",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}

