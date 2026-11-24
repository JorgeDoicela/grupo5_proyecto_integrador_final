# Formalización en Lógica de Primer Orden (LPO) y Métodos de Razonamiento

## 1. Definición del Vocabulario en Lógica de Primer Orden (LPO)

Para superar las limitaciones de la lógica proposicional (que no distingue individuos ni relaciones generales) y expresar conocimiento universal sobre cualquier paciente, se define el siguiente lenguaje de primer orden:

* **Dominio del discurso ($\mathcal{U}$):** Conjunto de pacientes humanos, síntomas clínicos y enfermedades respiratorias.
* **Variables:** $x$ (representa un paciente cualquiera del dominio), $d$ (representa una enfermedad).
* **Constantes de síntomas:** $\text{Fiebre}$, $\text{Tos}$, $\text{Disnea}$, $\text{DolorGarganta}$, $\text{Fatiga}$, $\text{PerdidaOlfato}$.
* **Constantes de enfermedades:** $\text{ResfriadoComun}$, $\text{Gripe}$, $\text{COVID19}$, $\text{Asma}$, $\text{Neumonia}$.
* **Predicados:**
  * $\text{Paciente}(x)$: "$x$ es un paciente bajo evaluación clínica".
  * $\text{PresentaSintoma}(x, s)$: "el paciente $x$ manifiesta el síntoma $s$".
  * $\text{PosibleDiagnostico}(x, d)$: "se infiere la hipótesis diagnóstica $d$ para el paciente $x$".
  * $\text{RequiereAtencionUrgente}(x)$: "el paciente $x$ requiere atención médica prioritaria".
  * $\text{SeveridadCritica}(d)$: "la enfermedad $d$ tiene clasificación clínica crítica".

---

## 2. Formalización de Enunciados en LPO (6 Enunciados Formales)

### Enunciado 1 (Regla $R_1$ — Resfriado común)
* **Lenguaje natural:** Todo paciente que presente dolor de garganta y fatiga tiene un posible diagnóstico de resfriado común.
* **Fórmula LPO:**
$$\forall x \Big( \big(\text{Paciente}(x) \land \text{PresentaSintoma}(x, \text{DolorGarganta}) \land \text{PresentaSintoma}(x, \text{Fatiga})\big) \rightarrow \text{PosibleDiagnostico}(x, \text{ResfriadoComun}) \Big)$$
* **Explicación:** El cuantificador universal ($\forall x$) garantiza que la regla se aplica a cualquier individuo del dominio que cumpla simultáneamente ser paciente y presentar ambos síntomas.

### Enunciado 2 (Regla $R_2$ — Gripe)
* **Lenguaje natural:** Todo paciente que presente fiebre, tos y fatiga tiene un posible diagnóstico de gripe.
* **Fórmula LPO:**
$$\forall x \Big( \big(\text{Paciente}(x) \land \text{PresentaSintoma}(x, \text{Fiebre}) \land \text{PresentaSintoma}(x, \text{Tos}) \land \text{PresentaSintoma}(x, \text{Fatiga})\big) \rightarrow \text{PosibleDiagnostico}(x, \text{Gripe}) \Big)$$
* **Explicación:** Incorpora una conjunción ternaria de síntomas sistémicos y respiratorios que caracteriza el síndrome gripal.

### Enunciado 3 (Regla $R_3$ — COVID-19)
* **Lenguaje natural:** Todo paciente que presente fiebre, tos y pérdida de olfato tiene un posible diagnóstico de COVID-19.
* **Fórmula LPO:**
$$\forall x \Big( \big(\text{Paciente}(x) \land \text{PresentaSintoma}(x, \text{Fiebre}) \land \text{PresentaSintoma}(x, \text{Tos}) \land \text{PresentaSintoma}(x, \text{PerdidaOlfato})\big) \rightarrow \text{PosibleDiagnostico}(x, \text{COVID19}) \Big)$$
* **Explicación:** La presencia del predicado $\text{PresentaSintoma}(x, \text{PerdidaOlfato})$ actúa como discriminador neurosensorial frente a la gripe común.

### Enunciado 4 (Regla $R_4$ — Asma)
* **Lenguaje natural:** Todo paciente que presente dificultad para respirar y tos tiene un posible diagnóstico de asma.
* **Fórmula LPO:**
$$\forall x \Big( \big(\text{Paciente}(x) \land \text{PresentaSintoma}(x, \text{Disnea}) \land \text{PresentaSintoma}(x, \text{Tos})\big) \rightarrow \text{PosibleDiagnostico}(x, \text{Asma}) \Big)$$
* **Explicación:** Modela el cuadro obstructivo bronquial básico caracterizado por disnea y tos sin requerir fiebre en el antecedente.

### Enunciado 5 (Regla $R_5$ — Neumonía)
* **Lenguaje natural:** Todo paciente que presente fiebre, dificultad para respirar y tos tiene un posible diagnóstico de neumonía.
* **Fórmula LPO:**
$$\forall x \Big( \big(\text{Paciente}(x) \land \text{PresentaSintoma}(x, \text{Fiebre}) \land \text{PresentaSintoma}(x, \text{Disnea}) \land \text{PresentaSintoma}(x, \text{Tos})\big) \rightarrow \text{PosibleDiagnostico}(x, \text{Neumonia}) \Big)$$
* **Explicación:** Especializa la regla $R_4$ agregando la condición febril, lo que eleva el nivel de alerta clínica de la inferencia.

### Enunciado 6 (Regla Complementaria de Triaje Crítico)
* **Lenguaje natural:** Si a un paciente se le infiere un posible diagnóstico cuya severidad es crítica, entonces el paciente requiere atención médica urgente.
* **Fórmula LPO:**
$$\forall x \, \forall d \Big( \big(\text{PosibleDiagnostico}(x, d) \land \text{SeveridadCritica}(d)\big) \rightarrow \text{RequiereAtencionUrgente}(x) \Big)$$
* **Explicación:** Demuestra encadenamiento multi-paso: el consecuente derivado por $R_5$ ($\text{PosibleDiagnostico}(x, \text{Neumonia})$) alimenta una regla de segundo nivel para activar alertas de urgencia.

---

## 3. Selección y Justificación del Método de Razonamiento

El sistema utiliza **Razonamiento Deductivo mediante Encadenamiento hacia Adelante (*Forward Chaining*)** apoyado en las reglas de inferencia **Instanciación Universal (IU)** y **Modus Ponens (MP)**, complementado con **Resolución de Conflictos**.

### Justificación Técnica

1. **Naturaleza orientada a datos (*Data-Driven*):** En una consulta de triaje respiratorio, el punto de partida son los hechos observados (síntomas que reporta el paciente), y el objetivo es derivar todas las hipótesis diagnósticas consistentes con dichos hechos. El encadenamiento hacia adelante parte exactamente de los datos iniciales hacia las conclusiones.
2. **Detección de diagnósticos múltiples:** A diferencia de un árbol binario rígido que se detiene en la primera coincidencia, *Forward Chaining* evalúa toda la base de reglas y detecta cuadros concurrentes o diferenciales.
3. **Resolución de conflictos determinista:** Cuando más de una regla se dispara simultáneamente (como ocurre con $R_4$ y $R_5$), el motor ordena las hipótesis mediante tres criterios jerárquicos:
   - **Especificidad:** Mayor número de premisas satisfechas (ej. 3 premisas prevalecen sobre 2).
   - **Severidad clínica:** $\text{CRITICAL} > \text{HIGH} > \text{MEDIUM} > \text{LOW}$.
   - **Prioridad explícita de la regla:** Valor entero configurado en la base de conocimiento.

---

## 4. Derivación Formal de Conclusiones (4 Casos Demostrados)

### Conclusión 1: Diagnóstico de COVID-19 (Paciente $p_1$)

* **Base de Hechos (Memoria de Trabajo):**
  1. $\text{Paciente}(p_1)$
  2. $\text{PresentaSintoma}(p_1, \text{Fiebre})$
  3. $\text{PresentaSintoma}(p_1, \text{Tos})$
  4. $\text{PresentaSintoma}(p_1, \text{PerdidaOlfato})$
* **Proceso Deductivo:**
  1. Se aplica **Instanciación Universal (IU)** sobre la regla $R_3$ sustituyendo $x / p_1$:
     $(\text{Paciente}(p_1) \land \text{PresentaSintoma}(p_1, \text{Fiebre}) \land \text{PresentaSintoma}(p_1, \text{Tos}) \land \text{PresentaSintoma}(p_1, \text{PerdidaOlfato})) \rightarrow \text{PosibleDiagnostico}(p_1, \text{COVID19})$.
  2. Por **Introducción de la Conjunción** sobre los hechos 1, 2, 3 y 4, el antecedente es verdadero.
  3. Por **Modus Ponens (MP)** se deriva: $\text{PosibleDiagnostico}(p_1, \text{COVID19})$.
* **Resultado:** Hipótesis única inferida: **COVID-19** (sin conflictos).

### Conclusión 2: Resolución de Conflicto Neumonía vs. Asma y Alerta Crítica (Paciente $p_2$)

* **Base de Hechos:**
  1. $\text{Paciente}(p_2)$, $\text{PresentaSintoma}(p_2, \text{Fiebre})$, $\text{PresentaSintoma}(p_2, \text{Disnea})$, $\text{PresentaSintoma}(p_2, \text{Tos})$.
  2. Hecho de dominio: $\text{SeveridadCritica}(\text{Neumonia})$.
* **Proceso Deductivo:**
  1. Instanciando $R_4$ con $x / p_2$ y aplicando **Modus Ponens**, se deriva $\text{PosibleDiagnostico}(p_2, \text{Asma})$ (especificidad = 2, severidad = `HIGH`).
  2. Instanciando $R_5$ con $x / p_2$ y aplicando **Modus Ponens**, se deriva $\text{PosibleDiagnostico}(p_2, \text{Neumonia})$ (especificidad = 3, severidad = `CRITICAL`).
  3. **Resolución de conflictos:** $R_5$ supera a $R_4$ en especificidad ($3 > 2$) y en severidad (`CRITICAL` $>$ `HIGH`), por lo que **Neumonía** se selecciona como hipótesis principal y **Asma** como diagnóstico diferencial secundario.
  4. **Encadenamiento de segundo nivel (Enunciado 6):** Instanciando $x / p_2$ y $d / \text{Neumonia}$ y aplicando **Modus Ponens** con $\text{SeveridadCritica}(\text{Neumonia})$, se deriva $\text{RequiereAtencionUrgente}(p_2)$.
* **Resultado:** **Neumonía (principal, atención urgente)** y **Asma (diferencial)**.

### Conclusión 3: Diagnóstico Concurrente de Gripe y Resfriado Común (Paciente $p_3$)

* **Base de Hechos:**
  $\text{Paciente}(p_3)$, $\text{PresentaSintoma}(p_3, \text{Fiebre})$, $\text{PresentaSintoma}(p_3, \text{Tos})$, $\text{PresentaSintoma}(p_3, \text{Fatiga})$, $\text{PresentaSintoma}(p_3, \text{DolorGarganta})$.
* **Proceso Deductivo:**
  1. Por IU y MP sobre $R_1$ ($T \land A$) se deriva $\text{PosibleDiagnostico}(p_3, \text{ResfriadoComun})$ (especificidad = 2, severidad = `LOW`).
  2. Por IU y MP sobre $R_2$ ($F \land C \land A$) se deriva $\text{PosibleDiagnostico}(p_3, \text{Gripe})$ (especificidad = 3, severidad = `MEDIUM`).
  3. Por resolución de conflictos, **Gripe** se prioriza como hipótesis principal ($3 > 2$ y severidad moderada frente a baja).
* **Resultado:** **Gripe (principal)** y **Resfriado común (diferencial)**.

### Conclusión 4: Evidencia Insuficiente y Coincidencias Parciales (Paciente $p_4$)

* **Base de Hechos:**
  $\text{Paciente}(p_4)$, $\text{PresentaSintoma}(p_4, \text{Fiebre})$, $\text{PresentaSintoma}(p_4, \text{Tos})$.
* **Proceso Deductivo:**
  1. Ninguna de las cinco reglas ($R_1..R_5$) satisface completamente su conjunción de premisas; por tanto, **Modus Ponens** no se dispara y el sistema no emite un diagnóstico falso positivo.
  2. El módulo de análisis complementario reporta coincidencias parciales del 67% ($2/3$ premisas) para **Gripe** (falta Fatiga), **COVID-19** (falta Pérdida de olfato) y **Neumonía** (falta Dificultad para respirar), orientando al clínico sobre qué síntoma adicional indagar.
