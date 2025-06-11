ALTER TABLE public.appointments
ADD CONSTRAINT fk_appointments_provider
FOREIGN KEY (provider_id) 
REFERENCES public.providers(id)
ON DELETE SET NULL; -- Or ON DELETE RESTRICT / CASCADE as appropriate

COMMENT ON CONSTRAINT fk_appointments_provider ON public.appointments IS 'Ensures provider_id in appointments references a valid provider. Sets provider_id to NULL if the provider is deleted.'; 