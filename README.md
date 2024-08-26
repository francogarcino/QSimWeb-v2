[![coverage report](https://gitlab.com/qweb-project/qweb/badges/master/coverage.svg)](https://gitlab.com/qweb-project/qweb/-/commits/master)
[![version](https://img.shields.io/badge/version-1.5.0-informational.svg)](https://gitlab.com/qweb-project/qweb)

# QSim-Web

Un simulador para el lenguaje de bajo nivel **Q**, utilizado en la Universidad Nacional de Quilmes con propósitos educativos

## Demo
https://qweb-unq.herokuapp.com/

### Q1 - La base
Esta iteración del lenguaje solo consta de Registros y dos modos de direccionamiento:

| Modo     | Código | Aclaración |
| -------- | ------ | ---------- |
| Registro | 100XXX | Dónde XXX es la codificación binaria del número de registro [0;7] |
| Inmediato | 000000 | - |

Además cuenta con las siguientes operaciones:

| Operación | Efecto | Código |
| ------ | ------ | ------ |
| **MUL** | destino ← destino * origen | 0000 |
| **MOV** | destino ←  origen | 0001 |
| **ADD** | destino ← destino + origen | 0010 |
| **SUB** | destino ← destino - origen | 0011 |
| **DIV** | destino ← destino % origen | 0111 |


### Q2 - Accediendo a memoria
Como Q1 es muy limitado, por no poder hacer uso de la memoria, en esta iteración se agrega un nuevo modo de direccionamiento, quedando:

| Modo | Código | Aclaración |
| ------ | ------ | ------ |
| Registro | 100XXX | Dónde XXX es la codificación binaria del número de registro [0;7] |
| Inmediato | 000000 | - |
| *Directo* | *001000* | - |

En esta iteración no se agregan instrucciones


### Q3 - Invocando rutinas
En esta iteración se agregan las operaciones CALL y RET, las cuales permiten invocar una rutina y volver de ella respectivamente.
Esta funcionalidad nos permite reutilizar código y abstraerlo, dándole un nombre.

| Operación | Efecto | Código |
| ------ | ------ | ------ |
| **MUL** | destino ← destino * origen | 0000 |
| **MOV** | destino ←  origen | 0001 |
| **ADD** | destino ← destino + origen | 0010 |
| **SUB** | destino ← destino - origen | 0011 |
| **DIV** | destino ← destino % origen | 0111 |
| **CALL** | [SP] ← PC, PC ← origen, SP ← SP - 1  | 1011 |
| **RET** | SP ← SP + 1, PC ← [SP]  | 1100 |

Como se ve, se introducen los conceptos de PC (Program Counter) y SP (Stack Pointer) e implícitamente el concepto de Pila, que será el lugar donde se almacenen los PCs de los sucesivos CALLs.
