# AGENTS.md - Guía para Agentes de Código (Back)

### Comandos principales
```bash
yarn dev          # Iniciar servidor de desarrollo (puerto 3000)
yarn build        # Compilar TypeScript y construir para producción
yarn start        # Ejecutar build de producción
yarn typecheck    # Verificar tipos sin emitir
yarn lint         # Ejecutar ESLint para verificar código
yarn test         # Correr las pruebas una vez
```

### Notas
- El framework de testing es **Vitest 5** (`vitest.config.ts` en la raíz): `environment: node`, alias `@/` → `src/`, tests en `test/**/*.test.ts` (la carpeta `test/` replica la jerarquía de `src/`)
- El servidor de desarrollo usa tsx con watch mode
- Puerto por defecto: 3000 (configurable vía PORT en .env)

---

## 2. Estructura del Proyecto

```
back/
├── src/
│   ├── main.ts                 # Composition root: env → app → listen(3000)
│   ├── app.ts                  # App factory: middlewares, routers
│   ├── config/
│   │   └── env.ts              # Variables de entorno validadas con zod
│   ├── types/                  # Tipos transversales (shared)
│   │   ├── index.ts            # Barrel
│   │   └── api.types.ts        # ApiResponse<T>
│   ├── routes/
│   │   └── index.ts            # Router raíz: /api/v1 → módulos
│   └── modules/
│       ├── types/              # Tipos compartidos entre módulos
│       │   └── greeting.types.ts
│       └── health/             # Módulo de ejemplo (hola mundo)
│           ├── application/    # Casos de uso (sin Express)
│           │   └── get-greeting.ts
│           └── infrastructure/
│               └── http/       # Adaptadores Express
│                   ├── health.controller.ts
│                   └── health.routes.ts
├── test/                      # Pruebas (replica la jerarquía de src/)
│   └── modules/
│       └── snailpay/
│           └── application/
│               └── process-charge.test.ts
├── package.json
├── vitest.config.ts            # Configuración de Vitest (alias @/, cobertura)
├── tsconfig.json               # Configuración TypeScript (editor + typecheck)
├── tsconfig.build.json         # Build real → dist/ (excluye *.test.ts)
├── eslint.config.js            # ESLint flat config
├── .gitignore
├── .env.example
└── AGENTS.md
```

---

## 3. Arquitectura Limpia - Regla de Dependencias

```
┌─────────────────────────────────────────────────────────┐
│                    main.ts (composition root)           │
│  Único lugar que instancia clases concretas e inyecta   │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  domain/    │ │application/ │ │infrastructure/│
    │  (vacío)    │ │  get-       │ │  http/       │
    │             │ │  greeting   │ │  controller  │
    └─────────────┘ └──────┬──────┘ └──────┬──────┘
                           │               │
                           ▼               ▼
                    ┌─────────────┐ ┌─────────────┐
                    │  modules/   │ │  config/    │
                    │   types/    │ │    env      │
                    └─────────────┘ └─────────────┘
```

**Reglas estrictas:**
1. `domain/` no importa nada externo (ni `shared`, ni `infrastructure`). Define puertos (interfaces).
2. `application/` importa solo `domain/` y `modules/types/`. Casos de uso puros, sin Express.
3. `infrastructure/` importa `application/` + `domain/` + `modules/types/`. Adaptadores: Express, zod, BD.
4. Los módulos **no se importan entre sí**; `src/routes/index.ts` es el único agregador.
5. `main.ts` es el único composition root.

---

## 4. Tipos e Interfaces

- **Carpeta propia**: `src/types/` (transversales) y `src/modules/types/` (compartidos entre módulos)
- `interface` para objetos, `type` para uniones/alias
- Un archivo por tema: `*.types.ts` (ej: `greeting.types.ts`, `payment.types.ts`)
- Cada carpeta expone `index.ts` con exports nombrados (barrel)
- **Nunca** usar `any`; usar `unknown` + narrowing

```typescript
// ✅ Correcto
import { ApiResponse } from '@/types';
import { Greeting } from '@/modules/types/greeting.types';

// ❌ Evitar
import { Greeting } from '../../modules/types/greeting.types';
```

---

## 5. Imports y Path Aliases

- Usar el alias `@/` para importar desde `src/`
- Orden de imports: librerías externas → `@/types` → `@/config` → `@/shared` → `@/modules`
- **Nunca** rutas relativas (`../../`)

```typescript
// ✅ Correcto
import { Router } from 'express';
import { ApiResponse } from '@/types';
import { Greeting } from '@/modules/types/greeting.types';
import { getGreeting } from '@/modules/health/application/get-greeting';
import { healthController } from '@/modules/health/infrastructure/http/health.controller';

// ❌ Evitar
import { getGreeting } from '../../../application/get-greeting';
```

---

## 6. Convenciones de Nombres

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Archivos de tipos | `*.types.ts` | `greeting.types.ts`, `payment.types.ts` |
| Archivos de casos de uso | kebab-case | `get-greeting.ts`, `process-payment.ts` |
| Archivos de controllers | `*.controller.ts` | `health.controller.ts` |
| Archivos de routes | `*.routes.ts` | `health.routes.ts` |
| Clases / Casos de uso | PascalCase | `GetGreeting`, `ProcessPayment` |
| Funciones | camelCase | `getGreeting`, `handleRequest` |
| Constantes | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE`, `MAX_RETRY` |
| Interfaces | PascalCase | `Greeting`, `PaymentRequest` |
| Type aliases | PascalCase | `PaymentStatus`, `ApiResponse` |

---

## 7. Contrato de Respuestas (ApiResponse)

Todas las respuestas HTTP siguen el mismo envelope que espera el front:

```typescript
interface ApiResponse<T> {
  done: boolean;
  msg: string;
  data?: T;
  count?: number;
  total?: number;
  rows?: T[];
}
```

- `done: true` + `data` → éxito
- `done: false` + `msg` → error
- Paginación: `count`, `total`, `rows`

**Helpers pendientes** (`shared/http/response.ts`): `ok()`, `created()`, `noContent()` — se crearán al agregar el segundo endpoint real.

---

## 8. Manejo de Errores

Actualmente no hay middleware de errores (un solo endpoint). Al agregar endpoints reales:

- Crear `shared/errors/AppError.ts` con `AppError`, `ValidationError`, `NotFoundError`
- Crear `middlewares/errorHandler.ts` que traduce errores a `ApiResponse`
- Crear `middlewares/validate.ts` con zod para validar `body`, `query`, `params`
- Los controllers **no usan try/catch**; lanzan `AppError` y el handler centralizado responde

---

## 9. Patrones

### Agregar un módulo nuevo
1. `mkdir -p src/modules/<nuevo>/application src/modules/<nuevo>/infrastructure/http`
2. Crear tipos en `src/modules/types/<nuevo>.types.ts` (o en `src/modules/<nuevo>/types/` si son internos)
3. Escribir caso de uso en `application/` (función pura, sin Express)
4. Crear `controller.ts` y `routes.ts` en `infrastructure/http/`
5. Registrar el router en `src/routes/index.ts`

### Agregar un endpoint
1. Definir tipos de request/response en `modules/types/` o `types/`
2. Escribir caso de uso en `application/`
3. Crear controller en `infrastructure/http/*.controller.ts`
4. Añadir ruta en `*.routes.ts`
5. El router del módulo ya está registrado en `routes/index.ts`

### Agregar un test
1. Colocarlo en `test/` replicando la ruta de `src/`: `test/modules/<módulo>/<capa>/<nombre>.test.ts`
2. Importar con el alias `@/` y usar `import type` para los tipos (`verbatimModuleSyntax`)
3. Inyectar dependencias con fakes (p. ej. un `SnailPayConfigPort`) en lugar de instancias concretas
4. Si el caso depende de la fecha, fijar el reloj con `vi.useFakeTimers()` + `vi.setSystemTime()`
5. Correr `yarn test` o `yarn test:coverage`; los `*.test.ts` están excluidos del build y no llegan a `dist/`

---

## 10. Reglas Importantes

1. **NO** agregar comentarios innecesarios
2. **SIEMPRE** tipar funciones y componentes
3. **USAR** el alias `@/` para imports (nunca rutas relativas `../../`)
4. **MANTENER** destructuring consistente
5. **USAR** `key` única en listas (preferir IDs del backend)
6. **EVITAR** `any`, siempre tipar (usar `unknown` + type guards)
7. **NO** hardcodear valores, usar `config/env.ts` o constantes
8. **SIEMPRE** usar `ApiResponse<T>` como envelope de respuesta
9. **NO** usar `enum` (TypeScript `erasableSyntaxOnly: true`)
10. **SIEMPRE** validar entrada con zod (middleware `validate` pendiente)

---

## 11. Errores Comunes a Evitar

- Usar rutas relativas en lugar del alias `@/`
- Importar `process.env` directamente (usar `config/env.ts`)
- Poner lógica de negocio en controllers (va en `application/`)
- Importar un módulo desde otro módulo (usar `routes/index.ts`)
- Olvidar `verbatimModuleSyntax` → imports sin `.js` en ESM
- Usar `enum` en lugar de `type` uniones (`type Status = 'a' | 'b'`)
- No invalidar build por `noUnusedLocals` / `noUnusedParameters`