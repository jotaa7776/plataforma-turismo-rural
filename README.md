--Raíces Chile — Plataforma de Turismo Rural
Plataforma web desarrollada para potenciar el turismo rural, conectar a visitantes con emprendedores locales, explorar experiencias, gestionar reservas y administrar la plataforma de forma ágil y segura.

--Tecnologías Utilizadas
Frontend: React, TypeScript, Tailwind CSS, Vite.

Backend y Base de Datos: Supabase (Autenticación Cloud, Base de Datos Relacional y Políticas de Seguridad RLS).

Gestión de Proyecto: Taiga (Metodología Scrum / 3 Sprints).

Actualización Importante (Rediseño de la Plataforma)
Se informa que la plataforma ha sido completamente rediseñada y desarrollada nuevamente desde cero. Este nuevo despliegue en el repositorio principal incluye:

Una arquitectura frontend modernizada y optimizada con componentes limpios y modulares.

Integración mejorada y más fluida con los servicios en la nube de Supabase para la autenticación y persistencia de datos.

Refactorización completa de los flujos de usuario (autenticación segura, catálogo interactivo, sistema de reservas y panel de administración).

 Instrucciones de Instalación y Ejecución Local
Clonar el repositorio:

Bash
git clone https://github.com/tu-usuario/plataforma-turismo-rural.git
Instalar las dependencias (usando Bun o npm):

Bash
bun install
# o
npm install
Configurar el archivo .env con las credenciales correspondientes de Supabase.

Ejecutar el servidor de desarrollo:

Bash
bun run dev
# o
npm run dev
Desarrollado por el equipo de ingeniería: Joaquín Navarro, Benjamín Villarroel y Frank Hafelin.
