# Sistema Experto de Detección de Enfermedades Respiratorias

Proyecto Integrador Final — Asignatura **Representación del Conocimiento y Razonamiento (UBE)**.

## Estructura del Repositorio

```text
.
├── docker-compose.yml              # Orquestación Next.js + PostgreSQL 16
├── .env.example                    # Plantilla de variables de entorno
├── PROYECTO INTEGRADOR FINAL.docx.pdf
├── docs/                           # Informe académico, diagramas y pseudocódigo PSeInt
└── web/                            # Aplicación Next.js Full-Stack (Clean Architecture + Prisma)
```

## Arquitectura Técnica

- **Dominio (`web/src/domain/`):** Motor de inferencia puro (*Forward Chaining*, *Modus Ponens* y resolución de conflictos por especificidad, severidad clínica y prioridad), generador dinámico de lógica proposicional, LPO, tablas de verdad y grafo semántico.
- **Persistencia (`web/prisma/`):** PostgreSQL 16 con tablas normalizadas (`symptoms`, `diseases`, `rules`, `rule_symptoms`, `evaluations`), migraciones versionadas y seed idempotente con las 5 reglas base del enunciado.
- **API REST (`web/src/app/api/`):** Validación con Zod y respuestas de error estandarizadas según RFC 7807.
- **Interfaz (`web/src/components/`):** Evaluador clínico con traza deductiva, grafo de conocimiento SVG interactivo, visor de lógica formal/tablas de verdad, módulo CRUD de base de conocimiento e historial persistente.

## Despliegue con Docker (Producción o Local)

1. Copie el archivo de entorno y configure una contraseña segura:
   ```bash
   cp .env.example .env
   ```
2. Construya y levante los contenedores:
   ```bash
   docker compose up -d --build
   ```
3. Verifique estado y salud del servicio:
   ```bash
   docker compose ps
   curl http://127.0.0.1:3000/api/health
   ```

Al iniciar, el contenedor aplica automáticamente `prisma migrate deploy` y carga la base de conocimiento inicial de forma idempotente. Conecte su proxy inverso (Nginx, Caddy o Traefik) hacia `127.0.0.1:3000` con TLS en su dominio.
