# Sistema Experto de Detección de Enfermedades Respiratorias

Sistema basado en reglas desarrollado para el **Proyecto Integrador Final** de la asignatura **Representación del Conocimiento y Razonamiento (Universidad Bolivariana del Ecuador - UBE)**. Implementa un motor de inferencia con encadenamiento hacia adelante (*Forward Chaining*), aplicación de *Modus Ponens*, resolución de conflictos por especificidad y severidad clínica, generación dinámica de tablas de verdad, formalización en Lógica de Primer Orden (LPO) y visualización de grafos de conocimiento persistidos en PostgreSQL.

Demostración desplegada: `https://proyecto-final-integrador-grupo-5.doicela.dev`

---

## Requisitos Previos

* **Docker** >= 24.0 y **Docker Compose** v2 (para ejecución contenerizada).
* **Node.js** >= 22.0 y **npm** >= 10.0 (solo para desarrollo local o ejecución de pruebas fuera de Docker).
* **PSeInt** (opcional, para validar el pseudocódigo en `docs/02-algoritmo-y-grafos/sistema_deteccion_respiratoria.psc`).

---

## Inicio Rápido (Docker Local)

```bash
git clone https://github.com/JorgeDoicela/grupo5_proyecto_integrador_final.git
cd grupo5_proyecto_integrador_final
cp .env.example .env
# Editar .env y asignar una contraseña segura en POSTGRES_PASSWORD

# Modo desarrollo con recarga en caliente (Hot Reload):
docker compose -f docker-compose.dev.yml up -d --build

# Modo build de producción local:
docker compose up -d --build
```

Verificación del servicio:

```bash
docker compose ps
curl http://127.0.0.1:3000/api/health
```

---

## Comandos Principales (`web/`)

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo de Next.js. |
| `npm run typecheck` | Ejecuta validación estricta de tipos TypeScript (`tsc --noEmit`). |
| `npm test` | Ejecuta las pruebas unitarias del motor de inferencia con Vitest. |
| `npm run build` | Genera la compilación de producción (`output: "standalone"`). |
| `npm run db:migrate` | Aplica migraciones versionadas de Prisma sobre PostgreSQL. |
| `npm run db:seed` | Carga de forma idempotente los 6 síntomas, 5 enfermedades y 5 reglas base. |

---

## Estructura del Repositorio

```text
.
├── .github/workflows/deploy.yml    # Pipeline CI/CD (tests, build GHCR y deploy SSH)
├── docker-compose.yml              # Orquestación para desarrollo local
├── docker-compose.prod.yml         # Orquestación productiva (PostgreSQL + App GHCR)
├── .env.example                    # Plantilla de variables de entorno sin credenciales
├── docs/                           # Documentación técnica modular e informe académico
└── web/                            # Aplicación Next.js Full-Stack + Prisma + Dockerfile
```

---

## Documentación Técnica y Académica

Consulta el catálogo completo en [Documentación Técnica Completa](docs/00-indice-general.md):

* Lógica proposicional, tablas de verdad y circuitos lógicos (`docs/01-logica-y-razonamiento/`).
* Formalización en Lógica de Primer Orden (LPO) y derivación de conclusiones (`docs/01-logica-y-razonamiento/`).
* Pseudocódigo PSeInt, diagrama de flujo y grafos de conocimiento (`docs/02-algoritmo-y-grafos/`).
* Arquitectura web, esquema PostgreSQL y despliegue (`docs/03-sistema-web/`).
* Informe académico consolidado de 12 secciones (`docs/04-entregable-academico/`).

---

## Seguridad de Secretos

Ninguna credencial, clave SSH ni archivo `.env` debe versionarse en el repositorio. El archivo `.gitignore` excluye `.env`, `.env.*`, `*.pem`, `*.key` y llaves privadas; utilice exclusivamente `.env.example` como referencia.
