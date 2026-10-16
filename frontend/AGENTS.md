# AGENTS.md - Guía para Agentes de Código

### Comandos principales
```bash
yarn dev          # Iniciar servidor de desarrollo (puerto 5173)
yarn build        # Compilar TypeScript y construir para producción
yarn build --base=./        # Compilar TypeScript y construir para producción
yarn lint         # Ejecutar ESLint para verificar código
yarn preview      # Vista previa de la build de producción
yarn test         # Correr las pruebas una vez
```

### Notas
- El framework de testing es **Vitest 5**, configurado en el bloque `test` de `vite.config.ts` (reusa plugins y alias `@/`)
- `environment: node` (no hay jsdom ni testing-library); los tests viven en `test/**/*.test.ts` (la carpeta `test/` replica la jerarquía de `src/`)
- El servidor de desarrollo usa Vite con HMR

---

## 2. Estructura del Proyecto

```
front/
├── src/
│   ├── api/                    # Capa de comunicación con API
│   │   ├── axiosClient.ts      # Instancia axios con interceptores
│   │   └── auth.ts             # Endpoints de autenticación (simulados en localStorage)
│   ├── components/             # Componentes reutilizables
│   │   ├── common/             # Button, Input, Card
│   │   ├── layout/             # Header, Sidebar, MainLayout
│   │   └── loader/             # GlobalLoader
│   ├── context/                # React Context
│   │   ├── saldoContext.ts     # Creación del context (utilidad)
│   │   ├── SaldoProvider.tsx   # Provider de saldo y total de apuestas
│   │   └── useSaldo.ts         # Hook para consumir el context
│   ├── hooks/                  # Hooks personalizados
│   │   └── useAuth.ts          # Registro, login, logout con validaciones
│   ├── interfaces/             # Interfaces compartidas (fuera de componentes)
│   │   ├── user.ts             # Usuario, RegisterData, LoginData, AuthState
│   │   ├── context.ts          # SaldoContextValue
│   │   └── index.ts            # Barrel export
│   ├── screens/                # Vistas/páginas
│   │   ├── auth/               # LoginScreen, RegisterScreen
│   │   └── dashboard/          # DashboardScreen, SaldoScreen, MovimientosScreen
│   ├── router/                 # Enrutamiento
│   │   ├── AppRouter.tsx       # Definición de rutas públicas y privadas
│   │   ├── PrivateRoute.tsx    # Protege rutas (requiere sesión)
│   │   └── PublicRoute.tsx     # Solo accesibles sin sesión (login/register)
│   ├── utils/                  # Utilidades
│   │   ├── encryption.ts       # Encriptación simple de passwords (XOR + base64)
│   │   ├── storage.ts          # Helpers de localStorage
│   │   └── validation.ts       # Validaciones (email, password, etc.)
│   ├── App.tsx                 # Componente raíz
│   └── main.tsx                # Entry point
├── test/                       # Pruebas (replica la jerarquía de src/)
│   └── api/
│       └── snailpay.test.ts    # Envío de la recarga al back
├── package.json
├── vite.config.ts              # Configuración Vite + Tailwind + alias @/ (bloque test)
└── tsconfig.app.json           # Configuración TypeScript (paths @/*)
```

---

## 3. Convenciones de Código

### 3.1 Imports y Path Aliases
- Usar el alias `@/` para importar desde `src/`
- Orden de imports: React → librerías externas → componentes → tipos → assets

```typescript
// ✅ Correcto
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { getProductos, Producto } from '@/api/molinos/productos';
import { useSaldo } from '@/context/useSaldo';

// ❌ Evitar
import Button from '../../components/common/Button';
import { getProductos } from '../api/molinos/productos';
```

### 3.2 Componentes React

**Estructura de componentes:**
- Usar functional components con TypeScript
- Props con interfaz dedicada
- forwardRef cuando sea necesario para componentes uncontrolled

```typescript
// ✅ Componente con props tipadas
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    // implementación
  }
);

Button.displayName = 'Button';
export default Button;
```

**Pantallas divididas en componentes:**
- `screens/` conserva estado, queries y mutations; el JSX por secciones baja a
  `components/<módulo>/<pantalla>/`, **replicando la ruta de la pantalla**
- Un archivo por componente con export por defecto; los tipos y helpers del
  módulo van en `usuarios.types.ts` / `usuarios.utils.ts` (naming del módulo)
- Los componentes se comunican con la pantalla por props: datos de entrada,
  callbacks de salida. Las `useMutation` y los avisos de confirmación
  (`Swal` / `toast`) viven en la pantalla
- El patrón se repite por módulo: `components/molinos/registro-diario/`
  agrupa `RegistroDiarioHeader`, `HistorialRegistros`, `RegistroForm`,
  `RegistroFormModal`, `SeccionRegistro` y `AnalisisDiarioModal`
- Cada carpeta expone un `index.ts` con exports nombrados; los componentes
  internos solo se importan entre sí con `./` (nunca a través del barrel, evita
  ciclos)

```typescript
front/src/screens/admin/usuarios/UsuariosScreen.tsx
front/src/components/admin/usuarios/
├── index.ts                 # Barrel con los exports nombrados
├── usuarios.types.ts        # Tipos compartidos del módulo
├── usuarios.utils.ts        # PAGE_SIZE, validadores, helpers
├── UsuariosToolbar.tsx      # Encabezado + acciones + búsqueda
├── UsuariosTabla.tsx        # Lista + estado vacío + paginación
├── UsuarioAcciones.tsx      # Columna de acciones de la fila
├── UsuarioBajaAlta.tsx      # Alta/baja de un registro
├── UsuarioEliminar.tsx      # Borrado definitivo
├── UsuarioFormModal.tsx     # Modal de nuevo / editar
├── UsuarioPermisosMenu.tsx  # Matriz de permisos del formulario
└── UsuarioPasswordModal.tsx # Modal de cambio de contraseña
```

```typescript
// ✅ La pantalla importa desde el barrel de su módulo
import {
  PAGE_SIZE,
  UsuariosToolbar,
  UsuariosTabla,
  UsuarioFormModal,
} from '@/components/admin/usuarios';

// ✅ Dentro de la carpeta, los hermanos se importan con ./
import UsuariosTabla from './UsuariosTabla';
```

**Lazy loading de rutas:**
```typescript
// ✅ Cargar componentes de forma lazy
const ProductosScreen = lazy(() => import('@/screens/molinos/productos/ProductosScreen'));
```

### 3.3 Tipos e Interfaces

- Usar `interface` para objetos y `type` para uniones/alias
- Definir tipos en el mismo archivo o en archivos `types.ts` si son compartidos

```typescript
// ✅ Interfaces para datos de API
export interface Producto {
  id_producto: number;
  nombre: string;
  precio: number;
  // ...
}

// ✅ Response de API con paginación
export interface ApiResponse<T> {
  done: boolean;
  msg: string;
  count?: number;
  total?: number;
  rows?: T[];
  data?: T;
}
```

### 3.4 Convenciones de Nombres

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Archivos componentes | PascalCase | `Button.tsx`, `MainLayout.tsx` |
| Archivos utilities | camelCase | `axiosClient.ts`, `authStore.ts` |
| Funciones | camelCase | `getProductos`, `handleDelete` |
| Componentes React | PascalCase | `Button`, `ProductosScreen` |
| Interfaces | PascalCase | `ProductoProps`, `ApiResponse` |
| Constantes | UPPER_SNAKE_CASE | `API_URL`, `MAX_RETRY`, `PAGE_SIZE` |
| Variables estado | camelCase | `isLoading`, `searchTerm` |

### 3.5 Manejo de Errores

- Usar try/catch en funciones async
- Mostrar feedback al usuario con `react-hot-toast` o `Swal`

```typescript
// ✅ Manejo correcto de errores en mutations
const deleteMutation = useMutation({
  mutationFn: (id: number) => deleteProducto(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['productos'] });
    toast.success('Producto eliminado');
  },
  onError: () => {
    toast.error('Error al eliminar producto');
  },
});
```

### 3.6 Estados de Carga y Datos

- Mostrar `GlobalLoader` mientras cargan datos
- Manejar estados de datos vacíos

```typescript
// ✅ Carga y datos
if (isLoading) return <GlobalLoader />;

return (
  <div>
    {data?.length === 0 ? (
      <p>No hay productos</p>
    ) : (
      data?.map(producto => <div key={producto.id}>{producto.nombre}</div>)
    )}
  </div>
);
```

---

## 4. Patrones y Pautas

### 4.1 React Query (TanStack Query)

- Usar `useQuery` para fetch de datos
- Usar `useMutation` para modificaciones
- Invalidar queries relacionados después de mutaciones

```typescript
// Query con clave personalizada
const { data } = useQuery({
  queryKey: ['productos', idSucursal, searchTerm],
  queryFn: async () => {
    const response = await getProductos(idSucursal, searchTerm);
    return response.rows || [];
  },
  enabled: !!idSucursal, // evitar ejecución si no hay sucursal
});
```

### 4.2 Estado Global (React Context)

- Usar React Context para estado compartido entre componentes (saldo, total de apuestas)
- **NO** se usa Zustand en el frontend por el momento (sí se usará en backend cuando se defina)

```typescript
// ✅ Context en archivos separados: saldoContext.ts (creación), SaldoProvider.tsx (componente), useSaldo.ts (hook)
import { SaldoProvider } from '@/context/SaldoProvider';
import { useSaldo } from '@/context/useSaldo';

// Interfaces compartidas van en src/interfaces/, nunca dentro de componentes
import type { SaldoContextValue } from '@/interfaces/context';
```

### 4.3 Rutas con React Router

- Usar `<Outlet />` en layouts para renderizar rutas anidadas
- Proteger rutas con componentes wrapper

```typescript
// ✅ MainLayout con Outlet
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div>
      <Sidebar />
      <main><Outlet /></main>
    </div>
  );
}

// ✅ Rutas protegidas
<Route element={<PrivateRoute />}>
  <Route element={<MainLayout />}>
    <Route path="productos" element={<ProductosScreen />} />
  </Route>
</Route>
```

### 4.4 Estilos con Tailwind CSS

- Tailwind CSS v4 con plugin `@tailwindcss/vite` (sin `tailwind.config.js`; la configuración es CSS-first en `src/index.css` con `@import "tailwindcss"`)
- Usar `clsx` y `tailwind-merge` para clases condicionales

```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

className={twMerge(
  clsx(
    'base-styles',
    isActive && 'active-styles',
    className
  )
)}
```

### 4.5 Tests (Vitest)

- Correr con `yarn test` (una vez) o `yarn test:coverage` (reporte de cobertura)
- Los tests viven en `test/` replicando la ruta de `src/`: `test/api/<archivo>.test.ts`
- Dentro de un test importar siempre con el alias `@/` (nunca `./`): al no estar junto a su fuente, la ruta relativa no resuelve
- El entorno es `node` (no hay jsdom): se mockea el acceso a datos, no se renderizan componentes
- `vi.mock` para módulos que se importan (`@/api/auth`) y `vi.spyOn(axiosClient, 'post')` para las llamadas HTTP
- Limpiar siempre con `vi.restoreAllMocks()` en `afterEach` y usar `import { ... } from 'vitest'` explícito (sin globals)

---

## 6. APIs y Comunicación

### 6.1 Estructura de Endpoints con Paginación

```typescript
// GET/POST a endpoints específicos con paginación
export const getProductos = async (
  busqueda?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<ApiResponse<Producto>> => {
  const response = await axiosClient.post<ApiResponse<Producto>>(
    '/molinos/productos/getListProductos',
    { busqueda, page, pageSize }
  );
  return response.data;
};
```

### 6.2 Interceptores

- Request: agregar token Bearer automáticamente
- Response: manejar 401 logout

---

## 7. Reglas Importantes

1. **NO** agregar comentarios innecesarios
2. **SIEMPRE** tipar funciones y componentes
3. **USAR** el alias `@/` para imports (nunca rutas relativas `../../`)
4. **MANTENER** destructuring consistente
5. **USAR** `key` única en listas (preferir IDs del backend)
6. **EVITAR** `any`, siempre tipar
7. **NO** hardcodear valores, usar constantes o config
8. **SIEMPRE** manejar estados de carga y error
9. **SIEMPRE** implementar paginación en CRUDs con listas
10. **CORRER** `yarn lint` y `yarn test` antes de entregar

---

## 8. Errores Comunes a Evitar

- Olvidar `displayName` en componentes con `forwardRef`
- No usar `enabled` en useQuery cuando depende de valores que pueden ser null
- Olvidar invalidar queries después de mutations
- Usar rutas relativas en lugar del alias `@/`
- No manejar el caso de array vacío en renderizado
- Olvidar el `key` en elementos de lista
- No cerrar modales/dropdowns al hacer click fuera
- No implementar paginación en CRUDs con listas de datos