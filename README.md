# SauceDemo Playwright

Proyecto de automatizacion E2E con Playwright para validar flujos funcionales, smoke y regresion en SauceDemo.

## Known Bugs

Los siguientes bugs son conocidos para `problem_user` y estan documentados como pruebas etiquetadas con `@known-bug` en `tests/regression/regression.spec.ts`.

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
