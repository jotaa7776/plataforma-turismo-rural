# Raíces Chile — Plataforma de Turismo Rural

Plataforma web desarrollada para potenciar el turismo rural, conectar a visitantes con emprendedores locales, explorar experiencias, gestionar reservas y administrar la plataforma de forma ágil y segura.

---

##  Actualización Importante (Rediseño de la Plataforma)
Se informa que **la plataforma ha sido completamente rediseñada y desarrollada nuevamente** desde cero. Este nuevo despliegue en el repositorio principal incluye:
* Una arquitectura frontend modernizada y optimizada con componentes limpios y modulares.
* Integración mejorada y más fluida con los servicios en la nube de Supabase para la autenticación y persistencia de datos.
* Refactorización completa de los flujos de usuario (autenticación segura, catálogo interactivo, sistema de reservas y panel de administración).

---

##  Tecnologías Utilizadas
* **Frontend:** React, TypeScript, Tailwind CSS, Vite.
* **Backend y Base de Datos:** Supabase (Autenticación Cloud, Base de Datos Relacional y Políticas de Seguridad RLS).
* **Gestión de Proyecto:** Taiga (Metodología Scrum / 3 Sprints).

---

##  Instrucciones de Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/jotaa7776/plataforma-turismo-rural.git](https://github.com/jotaa7776/plataforma-turismo-rural.git)
**Instalar las dependencias:**

Bash
npm install
# o si utilizas bun:
bun install
**Configurar variables de entorno:**
Crea un archivo .env en la raíz del proyecto y añade tus credenciales de conexión con Supabase.

**Ejecutar el servidor de desarrollo:**

Bash
npm run dev
# o si utilizas bun:
bun run dev
