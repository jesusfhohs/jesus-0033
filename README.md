# Hello!

Estas son las instrucciones para el proyecto con sus ambientes correspondientes

### Levantar el proyecto, primero levantamos el backend

Navegar a el backend

```bash
cd backend
```

Dentro de backend duplica .env.example y renombralo a .env

## Instalar módulos de node

```bash
yarn
```

```bash
yarn dev  
```

### Si no tienes yarn instalalo con:
```bash
npm install -g yarn
```
### y vuelve a instalar y correr dev

### Para correr las pruebas:

### Teniendo en cuenta que está arriba el backend (en consola se tenga Server running on port 3000) levantamos el frontend

### Para eso nos movemos a frontend
```bash
cd ../frontend
```

## Instalar módulos de node

```bash
yarn
```

## Levantar ambiente de desarrollo

```bash
yarn dev  
```

---

## Pruebas (Vitest)

Cada ambiente tiene su propio comando. Primero levantamos las del backend:

```bash
cd backend
yarn test
```

Luego las del frontend:

```bash
cd ../frontend
yarn test
```
