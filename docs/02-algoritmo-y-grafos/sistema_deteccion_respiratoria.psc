// ============================================================================
// Proyecto Integrador Final - Representacion del Conocimiento y Razonamiento
// Sistema Experto de Deteccion de Enfermedades Respiratorias (Validado PSeInt)
// ============================================================================

Algoritmo SistemaDeteccionRespiratoria
    Definir F, C, S, T, A, L Como Logico
    Definir diagResfriado, diagGripe, diagCovid, diagAsma, diagNeumonia Como Logico
    Definir respuesta, continuar Como Caracter
    Definir totalDiagnosticos Como Entero

    continuar <- "S"

    Mientras Mayusculas(continuar) = "S" Hacer
        Limpiar Pantalla
        Escribir "============================================================"
        Escribir "   SISTEMA DE DETECCION DE ENFERMEDADES RESPIRATORIAS"
        Escribir "   Motor de Inferencia: Encadenamiento hacia Adelante"
        Escribir "============================================================"
        Escribir "Responda S (Si) o N (No) para cada sintoma observado:"
        Escribir ""

        // 1. Adquisicion de hechos (Memoria de Trabajo)
        F <- LeerSintoma("Fiebre (F)")
        C <- LeerSintoma("Tos (C)")
        S <- LeerSintoma("Dificultad para respirar (S)")
        T <- LeerSintoma("Dolor de garganta (T)")
        A <- LeerSintoma("Fatiga (A)")
        L <- LeerSintoma("Perdida de olfato (L)")

        // 2. Motor de Inferencia (Evaluacion de las 5 reglas con Modus Ponens)
        diagResfriado <- T Y A              // R1: (T ^ A) -> Resfriado comun
        diagGripe     <- F Y C Y A          // R2: (F ^ C ^ A) -> Gripe
        diagCovid     <- F Y C Y L          // R3: (F ^ C ^ L) -> COVID-19
        diagAsma      <- S Y C              // R4: (S ^ C) -> Asma
        diagNeumonia  <- F Y S Y C          // R5: (F ^ S ^ C) -> Neumonia

        totalDiagnosticos <- 0
        Si diagResfriado Entonces totalDiagnosticos <- totalDiagnosticos + 1 FinSi
        Si diagGripe Entonces totalDiagnosticos <- totalDiagnosticos + 1 FinSi
        Si diagCovid Entonces totalDiagnosticos <- totalDiagnosticos + 1 FinSi
        Si diagAsma Entonces totalDiagnosticos <- totalDiagnosticos + 1 FinSi
        Si diagNeumonia Entonces totalDiagnosticos <- totalDiagnosticos + 1 FinSi

        // 3. Salida de resultados y Resolucion de Conflictos (Especificidad + Severidad)
        Escribir ""
        Escribir "------------------------------------------------------------"
        Escribir "RESULTADOS DE LA INFERENCIA:"
        Escribir "------------------------------------------------------------"

        Si totalDiagnosticos = 0 Entonces
            Escribir "No se cumplio completamente ninguna regla diagnostica."
            Escribir "Recomendacion: Monitorear evolucion de sintomas o consultar medico."
        SiNo
            Si totalDiagnosticos > 1 Entonces
                Escribir "[AVISO] Se dispararon ", totalDiagnosticos, " reglas simultaneamente."
                Escribir "Ordenadas por especificidad y severidad clinica:"
                Escribir ""
            FinSi

            // Orden de prioridad: R5 (Critica, 3) -> R3 (Alta, 3) -> R2 (Moderada, 3) -> R4 (Alta, 2) -> R1 (Baja, 2)
            Si diagNeumonia Entonces
                Escribir " - [R5 | CRITICA]  Posible NEUMONIA (F ^ S ^ C) -> Requiere atencion urgente."
            FinSi
            Si diagCovid Entonces
                Escribir " - [R3 | ALTA]     Posible COVID-19 (F ^ C ^ L) -> Aislamiento y prueba confirmatoria."
            FinSi
            Si diagGripe Entonces
                Escribir " - [R2 | MODERADA] Posible GRIPE (F ^ C ^ A) -> Reposo e hidratacion."
            FinSi
            Si diagAsma Entonces
                Escribir " - [R4 | ALTA]     Posible ASMA (S ^ C) -> Evaluacion neumologica."
            FinSi
            Si diagResfriado Entonces
                Escribir " - [R1 | BAJA]     Posible RESFRIADO COMUN (T ^ A) -> Control sintomatico."
            FinSi
        FinSi

        Escribir ""
        Escribir "Desea evaluar otro paciente? (S/N): "
        Leer continuar
    FinMientras

    Escribir "Sesion finalizada."
FinAlgoritmo

Funcion valorLogico <- LeerSintoma(nombreSintoma)
    Definir entrada Como Caracter
    Definir valorLogico Como Logico
    Repetir
        Escribir Sin Saltar "  Presenta ", nombreSintoma, "? (S/N): "
        Leer entrada
        entrada <- Mayusculas(entrada)
        Si entrada <> "S" Y entrada <> "N" Entonces
            Escribir "  Entrada invalida. Ingrese unicamente S o N."
        FinSi
    Hasta Que entrada = "S" O entrada = "N"

    Si entrada = "S" Entonces
        valorLogico <- Verdadero
    SiNo
        valorLogico <- Falso
    FinSi
FinFuncion
