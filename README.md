# Hello!

Estas son las instrucciones para el proyecto con sus ambientes correspondientes

### Levantar el proyecto, primero levantamos el back

Navegar a el back 

```bash
cd back
```

Dentro de back duplica .env.example y renombralo a .env

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

### Teniendo en cuenta que está arriba el back (en consola se tenga Server running on port 3000) levantamos el front

### Para eso nos movemos a front
```bash
cd ../front
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

Cada ambiente tiene su propio comando. Primero levantamos las del back:

```bash
cd back
yarn test
```

Luego las del front:

```bash
cd ../front
yarn test
```
