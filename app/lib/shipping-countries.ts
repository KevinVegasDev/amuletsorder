/**
 * Países a los que NO realizamos envíos (Printful + política de la tienda).
 * Se excluyen del selector de dirección en el checkout.
 */
export const BLOCKED_SHIPPING_COUNTRY_CODES = [
  "RU", // Russia
  "BY", // Belarus
  "EC", // Ecuador
  "CU", // Cuba
  "IR", // Iran
  "SY", // Syria
  "KP", // North Korea
  "PS", // Palestine (Gaza Strip)
  // Nota: Crimea, Lugansk y Donetsk (Ucrania) no se pueden excluir por país;
  // son regiones de UA. Si hace falta, validar state en backend para UA.
] as const;

/** Códigos ISO 3166-1 alpha-2 permitidos para envío (todos menos BLOCKED). */
export const ALLOWED_SHIPPING_COUNTRY_CODES: string[] = [
  "AF", "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AG", "AR", "AM", "AW", "AU", "AT", "AZ",
  "BS", "BH", "BD", "BB", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR",
  "IO", "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "KY", "CF", "TD", "CL", "CN", "CX",
  "CC", "CO", "KM", "CG", "CD", "CK", "CR", "CI", "HR", "CW", "CY", "CZ", "DK", "DJ", "DM", "DO",
  "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF",
  "GA", "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW",
  "GY", "HT", "HM", "VA", "HN", "HK", "HU", "IS", "IN", "ID", "IQ", "IE", "IM", "IL", "IT",
  "JM", "JP", "JE", "JO", "KZ", "KE", "KI", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR",
  "LY", "LI", "LT", "LU", "MO", "MG", "MW", "MY", "MV", "ML", "MH", "MT", "MR", "MU", "YT",
  "MX", "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC",
  "NZ", "NI", "NE", "NG", "NU", "NF", "MK", "MP", "NO", "OM", "PK", "PW", "PA", "PG", "PY",
  "PE", "PH", "PN", "PL", "PT", "PR", "QA", "RE", "RO", "RW", "BL", "SH", "KN", "LC", "MF",
  "PM", "VC", "WS", "SM", "ST", "SA", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO",
  "ZA", "GS", "SS", "ES", "LK", "SD", "SR", "SJ", "SE", "CH", "TW", "TJ", "TZ", "TH", "TL",
  "TG", "TK", "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "US", "UM",
  "UY", "UZ", "VU", "VE", "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW",
].filter((code) => !(BLOCKED_SHIPPING_COUNTRY_CODES as readonly string[]).includes(code));
