# Agency Luxury Self — release remoto para Nuklo

Este repositorio produce un release inmutable `remote-static-app` para el contrato `sales@1.1.0` de Nuklo. El artefacto final se genera en `out/` y contiene el manifest importable, un HTML fisico unico por descriptor de ruta, assets, metadatos SEO, mapa de redirecciones y `integrity.json` con SHA-256.

## Comandos

- `npm run release`: compila con la base publica versionada, prepara `out/`, ejecuta la validacion exacta del contrato de Nuklo cuando el Core hermano esta disponible, verifica integridad y revisa enlaces.
- `npm run prepare:release`: vuelve a crear el artefacto completo.
- `npm run verify:release`: valida manifest, rutas, HTML, metadatos y checksums.
- `npm run check:links`: revisa referencias locales, rutas declaradas y URLs del sitemap.

La URL importable es `https://themes.nuklo.cloud/agency-luxury-self/1.0.5/nuklo.template.json`. El host de releases se bloquea en `robots.txt` para evitar contenido duplicado; el tenant de Nuklo publica canonical, hreflang, robots y sitemap en su propio dominio.

En CI se debe pasar `THEME_SOURCE_COMMIT` (normalmente `GITHUB_SHA`) y, si corresponde, `THEME_SOURCE_BRANCH`. Un build local sin commit usa `local-uncommitted` de forma visible para QA, pero no debe registrarse como release de produccion.

El manifest incorpora `legacySeo` v1 para que Core aplique redirecciones 308 y respuestas 410 sin cadenas, bucles ni redirecciones blandas. `redirects.json` conserva el mismo mapa como sidecar operativo y auditable.
