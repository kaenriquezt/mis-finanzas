# Guía de configuración — mis finanzas

Sigue estos pasos en orden. Te toma entre 15 y 20 minutos la primera vez.

---

## Paso 1 — Instalar herramientas necesarias

1. Instala [Node.js](https://nodejs.org) (versión 18 o mayor)
2. Instala [Git](https://git-scm.com)
3. Crea una cuenta en [GitHub](https://github.com) si no tienes una

---

## Paso 2 — Crear el proyecto en Firebase

1. Ve a [https://console.firebase.google.com](https://console.firebase.google.com)
2. Clic en **"Crear un proyecto"**
3. Nombre del proyecto: `mis-finanzas` (o el que quieras)
4. Desactiva Google Analytics (no lo necesitas) → **Crear proyecto**
5. Una vez creado, clic en **"Web"** (el ícono `</>`)
6. Registra la app con el nombre `mis-finanzas`
7. **Copia el objeto `firebaseConfig`** que te aparece — lo necesitas en el siguiente paso

### Activar Firestore
1. En el menú izquierdo → **Firestore Database** → **Crear base de datos**
2. Selecciona **"Iniciar en modo de prueba"** → siguiente → **Listo**

### Activar Autenticación
1. En el menú → **Authentication** → **Comenzar**
2. En la pestaña **"Sign-in method"** → activa **Google**
3. Guarda

---

## Paso 3 — Configurar Firebase en el código

Abre el archivo `src/firebase.js` y reemplaza los valores del objeto `firebaseConfig` con los que copiaste en el Paso 2.

```js
const firebaseConfig = {
  apiKey: "AIza...",           // ← pega tu valor
  authDomain: "mi-proyecto.firebaseapp.com",
  projectId: "mi-proyecto",
  storageBucket: "mi-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

Luego abre `firestore.rules` y reemplaza `TU_EMAIL@gmail.com` con tu email de Google.

---

## Paso 4 — Subir el código a GitHub

1. Ve a [https://github.com/new](https://github.com/new)
2. Nombre del repositorio: `mis-finanzas`
3. Selecciona **Privado** ← importante para que nadie más vea tu código
4. Clic en **"Create repository"**
5. En tu computador, abre la terminal en la carpeta del proyecto y ejecuta:

```bash
git init
git add .
git commit -m "primera versión"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mis-finanzas.git
git push -u origin main
```

---

## Paso 5 — Activar GitHub Pages

1. En GitHub, ve a tu repositorio → **Settings** → **Pages**
2. En **Source**, selecciona **"GitHub Actions"**
3. El workflow ya está configurado — se ejecutará automáticamente cada vez que hagas push

Espera 2-3 minutos y tu app estará en:
`https://TU_USUARIO.github.io/mis-finanzas`

---

## Paso 6 — Aplicar reglas de seguridad en Firebase

1. Ve a Firebase Console → **Firestore Database** → **Reglas**
2. Pega el contenido del archivo `firestore.rules`
3. Clic en **Publicar**

---

## Actualizar la app en el futuro

Cada vez que hagamos cambios a la app, solo necesitas ejecutar:

```bash
git add .
git commit -m "descripción del cambio"
git push
```

GitHub Pages se actualiza automáticamente en 2-3 minutos. Tus datos en Firebase **no se tocan**.

---

## ¿Algo salió mal?

Los errores más comunes:

- **"Firebase: No API key"** → revisa que el `firebaseConfig` en `src/firebase.js` tenga tus valores reales
- **"Permission denied"** → verifica que tu email en `firestore.rules` sea exactamente igual al de tu cuenta Google
- **La app no carga en GitHub Pages** → espera 5 minutos y recarga; si sigue así, revisa la pestaña "Actions" en GitHub para ver el error
