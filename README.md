# EventCore - Sistema de Gestión de Eventos Institucionales

Este repositorio contiene el código fuente para **EventCore**, una plataforma moderna de gestión de eventos, registro de participantes y control de asistencia mediante códigos QR. El proyecto está dividido en una arquitectura desacoplada con carpetas independientes para el frontend y el backend.

---

## Estructura del Proyecto

*   **`frontend/`**: Aplicación de cliente desarrollada en React + Vite + TypeScript, estilizada con Tailwind CSS v4 y componentes adaptados para pantallas móviles, de escritorio y ultra-wide.
*   **`backend/`**: API REST en Node.js, Express y Sequelize ORM con soporte de base de datos PostgreSQL (alojado en Supabase).

---

## 1. Requisitos Previos e Instalación de PNPM

Este proyecto utiliza **pnpm** como gestor de paquetes por su eficiencia en espacio en disco y velocidad.

### En Windows
Puedes instalar `pnpm` de cualquiera de las siguientes formas:

1.  **A través de PowerShell (Recomendado)**:
    Abre PowerShell como Administrador y ejecuta:
    ```powershell
    iwr https://get.pnpm.io/install.ps1 -useb | iex
    ```
2.  **A través de NPM** (si ya tienes Node.js instalado):
    Abre tu terminal y ejecuta:
    ```bash
    npm install -g pnpm
    ```

### En Linux / macOS
Abre tu terminal y ejecuta:

1.  **A través de Curl (Recomendado)**:
    ```bash
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    ```
2.  **A través de NPM**:
    ```bash
    sudo npm install -g pnpm
    ```

*Una vez instalado, verifica que esté listo ejecutando `pnpm -v`.*

---

## 2. Descargar y Configurar el Proyecto

1.  **Clonar el repositorio**:
    ```bash
    git clone <url-del-repositorio>
    cd eventcore
    ```

2.  **Configurar Variables de Entorno (.env)**:
    Las credenciales de base de datos, contraseñas de tokens JWT y claves privadas son confidenciales. Por seguridad, **los archivos `.env` están agregados al archivo `.gitignore` raíz y nunca se subirán a Git.**
    
    Para configurar la aplicación localmente:
    *   Ve a la carpeta del backend:
        ```bash
        cd backend
        ```
    *   Copia el archivo de ejemplo para crear tu entorno local:
        ```bash
        cp .env.example .env
        ```
        *(En Windows PowerShell: `cp .env.example .env` o `copy .env.example .env`)*
    *   Abre el archivo `.env` recién creado y completa las claves de conexión de la base de datos Supabase, variables del pooler de conexiones y secretos JWT correspondientes proporcionados por el equipo de desarrollo.

---

## 3. Ejecución en Entorno de Desarrollo

### Levantar el Backend (API)
1.  Navega a la carpeta `backend`:
    ```bash
    cd backend
    ```
2.  Instala las dependencias necesarias:
    ```bash
    pnpm install
    ```
3.  Inicia el servidor en modo desarrollo:
    ```bash
    pnpm run dev
    ```
    *El backend se ejecutará en `http://localhost:3000` por defecto.*

### Levantar el Frontend (Cliente)
1.  Abre otra terminal y navega a la carpeta `frontend`:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    pnpm install
    ```
3.  Inicia el servidor local de desarrollo:
    ```bash
    pnpm run dev
    ```
    *El frontend se levantará en la dirección indicada por Vite (normalmente `http://localhost:5173`).*

---

## 4. Construcción para Producción

Para compilar el frontend optimizado para despliegue:
```bash
cd frontend
pnpm run build
```
Los archivos de distribución final listos para producción se generarán en la carpeta `frontend/dist/`.

---

## Seguridad de Credenciales (Git Ignore)
Recuerda que el archivo `.gitignore` en la raíz del proyecto está configurado para omitir las siguientes ubicaciones confidenciales:
*   `node_modules/` y `.pnpm-store/`
*   Archivos `.env`, `.env.local`, `.env.production.local` y similares.
*   Directorios de configuración de editores de código (`.vscode`, `.idea`).

**Bajo ninguna circunstancia debes forzar el commit de archivos `.env`.** Si creas una nueva variable de entorno requerida para el funcionamiento global, agrégala como referencia vacía dentro de `backend/.env.example` y documéntala en el canal del equipo.
