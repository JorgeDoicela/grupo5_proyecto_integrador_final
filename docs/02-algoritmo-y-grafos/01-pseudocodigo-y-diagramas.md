# Pseudocódigo (PSeInt), Diagrama de Flujo y Grafos de Conocimiento

## 1. Pseudocódigo Validado para PSeInt

El archivo fuente ejecutable se encuentra en [sistema_deteccion_respiratoria.psc](./sistema_deteccion_respiratoria.psc). Está redactado en sintaxis estándar de **PSeInt (perfil flexible/estricto)** con validación defensiva de entradas (`S`/`N`), evaluación independiente de las 5 reglas mediante operadores lógicos conjuntivos (`Y`) y presentación ordenada por especificidad y severidad clínica.

### Cobertura del Algoritmo
* **Entrada validada:** Función auxiliar `LeerSintoma(nombreSintoma)` que impide continuar hasta recibir `S` o `N`.
* **Evaluación completa:** Evalúa las 5 reglas ($R_1..R_5$) sin cortocircuitar de forma excluyente, permitiendo detectar diagnósticos concurrentes (como $R_5$ Neumonía junto con $R_4$ Asma).
* **Control de casos sin coincidencia:** Cuando `totalDiagnosticos = 0`, informa que ninguna regla se cumplió completamente y sugiere monitoreo clínico.
* **Ciclo iterativo:** Permite evaluar múltiples pacientes en la misma sesión de ejecución.

---

## 2. Diagrama de Flujo del Sistema

El diagrama utiliza simbología estándar de flujo (terminales Inicio/Fin, paralelogramos de entrada/salida, rombos de decisión y rectángulos de proceso):

```mermaid
flowchart TD
    Inicio(["INICIO"]) --> Init["continuar = 'S'"]
    Init --> Loop{"continuar = 'S'?"}
    Loop -- "No" --> Fin(["FIN"])
    Loop -- "Sí" --> Leer[/"Leer síntomas validados: F, C, S, T, A, L"/]

    Leer --> Eval["Evaluar reglas R1..R5 en Memoria de Trabajo"]
    Eval --> D1{"T AND A?"}
    D1 -- "Sí" --> M1["Activar R1: Resfriado común"]
    D1 -- "No" --> D2{"F AND C AND A?"}
    M1 --> D2

    D2 -- "Sí" --> M2["Activar R2: Gripe"]
    D2 -- "No" --> D3{"F AND C AND L?"}
    M2 --> D3

    D3 -- "Sí" --> M3["Activar R3: COVID-19"]
    D3 -- "No" --> D4{"S AND C?"}
    M3 --> D4

    D4 -- "Sí" --> M4["Activar R4: Asma"]
    D4 -- "No" --> D5{"F AND S AND C?"}
    M4 --> D5

    D5 -- "Sí" --> M5["Activar R5: Neumonía"]
    D5 -- "No" --> CheckTotal{"totalDiagnosticos = 0?"}
    M5 --> CheckTotal

    CheckTotal -- "Sí" --> OutNone[/"Mostrar: Ninguna regla satisfecha"/]
    CheckTotal -- "No" --> Sort["Ordenar hipótesis por especificidad y severidad"]
    Sort --> OutDiag[/"Mostrar diagnósticos inferidos y recomendaciones"/]

    OutNone --> AskNext[/"Leer: Evaluar otro paciente? (S/N)"/]
    OutDiag --> AskNext
    AskNext --> Loop
```

---

## 3. Grafo de Conocimiento (Red Semántica)

El grafo de conocimiento modela explícitamente los **nodos de síntomas**, los **nodos de reglas conjuntivas (nodos de inferencia)** y los **nodos de enfermedades**, conectados mediante aristas dirigidas etiquetadas (`presenta` e `infiere`). Esta representación tripartita evita la ambigüedad de un grafo bipartito simple (donde no se distingue si una enfermedad requiere conjunción `AND` o disyunción `OR` de sus síntomas).

```mermaid
flowchart LR
    subgraph Sintomas["Nodos de Síntomas"]
        F(("F: Fiebre"))
        C(("C: Tos"))
        S(("S: Dificultad respirar"))
        T(("T: Dolor garganta"))
        A(("A: Fatiga"))
        L(("L: Pérdida olfato"))
    end

    subgraph Reglas["Nodos de Reglas (Conjunción AND)"]
        R1["R1 (AND)"]
        R2["R2 (AND)"]
        R3["R3 (AND)"]
        R4["R4 (AND)"]
        R5["R5 (AND)"]
    end

    subgraph Enfermedades["Nodos de Enfermedades"]
        COLD["Resfriado común (LOW)"]
        FLU["Gripe (MEDIUM)"]
        COVID["COVID-19 (HIGH)"]
        ASTHMA["Asma (HIGH)"]
        PNEU["Neumonía (CRITICAL)"]
    end

    T -- "presenta" --> R1
    A -- "presenta" --> R1
    R1 -- "infiere" --> COLD

    F -- "presenta" --> R2
    C -- "presenta" --> R2
    A -- "presenta" --> R2
    R2 -- "infiere" --> FLU

    F -- "presenta" --> R3
    C -- "presenta" --> R3
    L -- "presenta" --> R3
    R3 -- "infiere" --> COVID

    S -- "presenta" --> R4
    C -- "presenta" --> R4
    R4 -- "infiere" --> ASTHMA

    F -- "presenta" --> R5
    S -- "presenta" --> R5
    C -- "presenta" --> R5
    R5 -- "infiere" --> PNEU
```

> [!NOTE]
> En la aplicación web desplegada, este grafo se genera dinámicamente en formato SVG interactivo desde el módulo [graph-builder.ts](../../web/src/domain/engine/graph-builder.ts) y [KnowledgeGraphView.tsx](../../web/src/components/KnowledgeGraphView.tsx) leyendo en tiempo real las tablas `symptoms`, `rules`, `rule_symptoms` y `diseases` de PostgreSQL.
