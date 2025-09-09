This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Soluciones Tipográficas Implementadas

### Problema de Espaciado en Fuentes

Durante el desarrollo del header, nos encontramos con problemas de espaciado inconsistente causados por las propiedades por defecto de las fuentes (line-height y letter-spacing). Esto creaba espacios no deseados que afectaban el diseño visual.

### Solución Aplicada

Para resolver estos problemas tipográficos, implementamos las siguientes clases de Tailwind CSS:

- **`leading-[0]`**: Establece line-height: 0px, eliminando el espaciado vertical por defecto
- **`tracking-[0]`**: Establece letter-spacing: 0px, eliminando el espaciado horizontal entre caracteres
- **Margin compensatorio**: Agregamos margin específico para lograr el centrado visual exacto

### Ventajas de esta Aproximación

1. **Control total**: Eliminamos la dependencia de valores por defecto inconsistentes
2. **Predictibilidad**: El espaciado es exactamente como lo diseñamos
3. **Escalabilidad**: Funciona consistentemente en diferentes tamaños de fuente
4. **Profesional**: Siguiendo las mejores prácticas de tipografía web moderna

### Código Ejemplo

```tsx
<nav className="flex items-center text-[24px] leading-[0] tracking-[0]">
  <Link href="/" className="px-4 py-2 text-black">
    + home
  </Link>
</nav>
```

Esta solución nos permite Solucionar el problema de centrado en el header ya que tenemos un mayor control sobre el espaciado dentro de la fuente
