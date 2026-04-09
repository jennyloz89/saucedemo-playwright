# SauceDemo Playwright

Proyecto de automatizacion E2E con Playwright para validar flujos funcionales, smoke y regresion en SauceDemo.

## Known Bugs

Los siguientes bugs son conocidos para `problem_user` y estan documentados como pruebas etiquetadas  `@known-bug` en `tests/regression/regression.spec.ts`.

- **BUG-01 - Imagenes de productos incorrectas**  
  Todas (o varias) imagenes de productos se repiten cuando deberian ser distintas.

- **BUG-02 - Sort Z-A inconsistente**  
  El ordenamiento descendente de nombres no siempre reordena correctamente.

- **BUG-03 - Last Name en checkout**  
  El campo Last Name puede no persistir correctamente y provocar validacion inesperada.

- **BUG-04 - Productos no agregables al carrito**  
  Algunos productos pueden no incrementar el contador del carrito como se espera.

## Tags utiles

- `@smoke`: suite critica y rapida.
- `@regression`: cobertura funcional ampliada.
- `@problem-user`: casos especificos del usuario con comportamiento defectuoso.
- `@known-bug`: documentacion ejecutable de bugs conocidos.

## Comandos utiles

- `npm run test:smoke`
- `npm run test:regression`
- `npx playwright test --grep "@known-bug"`

## HTML Report

El proyecto ya genera reporte HTML en la carpeta `reports/` por configuracion de Playwright.

- **Abrir ultimo reporte generado**
  - `npm run report:open`

- **Correr smoke y abrir reporte**
  - `npm run report:smoke`

- **Correr regression y abrir reporte**
  - `npm run report:regression`

En GitHub Actions, los reportes se publican como artifacts separados al final del job, incluso cuando hay fallos:

- `playwright-report-functional-<run_number>`
- `playwright-report-regression-<run_number>`

### Reporte en la web (enlace sin descargar ZIP)

Los artifacts son archivos ZIP: para ver el HTML con un **enlace directo** el workflow publica el mismo contenido en **GitHub Pages**.

1. En el repo: **Settings → Pages → Build and deployment**.
2. En **Source**, elige **GitHub Actions** (no “Deploy from a branch”).
3. Tras el siguiente push a `master`/`main`, el job **Publish reports to GitHub Pages** dejará la URL en el run (environment `github-pages`) y podrás abrir algo como:

   `https://jennyloz89.github.io/saucedemo-playwright/`

   Desde ahí entras a **Functional** o **Regression** sin descargar nada.

En **pull requests** no se despliega Pages (solo artifacts), para no mezclar previews con el sitio de la rama principal.
