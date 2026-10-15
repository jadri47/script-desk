# Script Desk

Revisa el guion de un episodio antes de grabar: anuncios de YouTube, estructura, citas bíblicas, español hablado, búsqueda, apertura en frío, prompter y resultados.

- **App:** https://jadri47.github.io/script-desk/
- **Datos:** Supabase (tablas `sd_team`, `sd_docs`, `sd_ai_usage`, con acceso solo para el equipo).
- **IA:** función `supabase/functions/sd-ai`; la clave de Anthropic vive como secreto en Supabase, nunca en esta página.

Para dar acceso a alguien, agrega su Gmail a la tabla `sd_team` en Supabase.
