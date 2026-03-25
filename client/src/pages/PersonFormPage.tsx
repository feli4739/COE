import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Stethoscope,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Gift,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { FormSection, Field } from "@/components/ui/FormSection";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { PageHeader } from "@/components/ui/PageHeader";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useToastStore } from "@/stores/toastStore";
import {
  personFormSchema,
  defaultPersonValues,
  type PersonFormValues,
} from "@/features/people/personSchema";
import { toPersonPayload, personToFormValues } from "@/features/people/mapPersonPayload";
import { calcAgeFromIsoDate } from "@/lib/calcAge";

export function PersonFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const toast = useToastStore((s) => s.show);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    mode: "onChange",
    defaultValues: defaultPersonValues,
  });

  const fechaNac = watch("fecha_nacimiento");
  const edadCalc = useMemo(() => calcAgeFromIsoDate(fechaNac ?? ""), [fechaNac]);

  useEffect(() => {
    if (!isEdit || !token || !id) return;
    let c = false;
    (async () => {
      try {
        const data = await apiFetch(`/people/${id}`, { token });
        if (!c) reset(personToFormValues(data as import("@/types/person").Person));
      } catch (e) {
        if (!c && e instanceof ApiError) setLoadErr(e.message);
      }
    })();
    return () => {
      c = true;
    };
  }, [isEdit, id, token, reset]);

  const onSubmit = async (values: PersonFormValues) => {
    if (!token) return;
    const body = toPersonPayload(values);
    try {
      if (isEdit && id) {
        await apiFetch(`/people/${id}`, {
          method: "PUT",
          token,
          body: JSON.stringify(body),
        });
        toast("Cambios guardados correctamente");
        navigate(`/people/${id}`);
      } else {
        const created = (await apiFetch("/people", {
          method: "POST",
          token,
          body: JSON.stringify(body),
        })) as { id: string };
        toast("Persona creada correctamente");
        navigate(`/people/${created.id}`);
      }
    } catch (e) {
      if (e instanceof ApiError) setLoadErr(e.message);
    }
  };

  if (loadErr && isEdit) {
    return <p className="text-red-400">{loadErr}</p>;
  }

  return (
    <div className="space-y-7 pb-28">
      <div>
        <Link
          to={isEdit && id ? `/people/${id}` : "/people"}
          className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {isEdit ? "Volver al perfil" : "Volver al listado"}
        </Link>
        <PageHeader
          title={isEdit ? "Editar persona" : "Nueva persona"}
          description="Formulario por bloques con validación al escribir. Los campos marcados con * son obligatorios."
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        <FormSection title="Datos personales" icon={User}>
          <Field label="Legajo" className="md:col-span-1">
            <Input placeholder="Opcional" {...register("legajo")} error={errors.legajo?.message} />
          </Field>
          <Field label="Apellido" required className="md:col-span-1">
            <Input {...register("apellido")} error={errors.apellido?.message} />
          </Field>
          <Field label="Nombre" required className="md:col-span-1">
            <Input {...register("nombre")} error={errors.nombre?.message} />
          </Field>
          <Field label="DNI" required className="md:col-span-1">
            <Input {...register("dni")} error={errors.dni?.message} />
          </Field>
          <Field label="Fecha de nacimiento" required className="md:col-span-1">
            <Input type="date" {...register("fecha_nacimiento")} error={errors.fecha_nacimiento?.message} />
          </Field>
          <Field label="Edad (calculada)" className="md:col-span-1">
            <div className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-muted">
              {edadCalc !== null ? `${edadCalc} años` : "—"}
            </div>
          </Field>
          <Field label="Sexo" className="md:col-span-2">
            <Select {...register("sexo")}>
              <option value="">Seleccionar</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="Otro">Otro</option>
            </Select>
          </Field>
        </FormSection>

        <FormSection title="Información médica" icon={Stethoscope}>
          <Field label="Grupo sanguíneo" className="md:col-span-1">
            <Input {...register("grupo_sanguineo")} />
          </Field>
          <Field label="Patología base" className="md:col-span-1">
            <Input {...register("patologia_base")} />
          </Field>
          <Field label="Observaciones médicas" className="md:col-span-2">
            <Textarea {...register("observaciones_medicas")} />
          </Field>
        </FormSection>

        <FormSection title="Contacto" icon={Phone}>
          <Field label="Email" className="md:col-span-1">
            <Input type="email" {...register("email")} error={errors.email?.message} />
          </Field>
          <Field label="Teléfono" className="md:col-span-1">
            <Input {...register("telefono")} />
          </Field>
          <Field label="Contacto de emergencia" className="md:col-span-2">
            <Input {...register("contacto_emergencia")} />
          </Field>
        </FormSection>

        <FormSection title="Dirección" icon={MapPin}>
          <Field label="Barrio" className="md:col-span-1">
            <Input {...register("barrio")} />
          </Field>
          <Field label="Calle" className="md:col-span-1">
            <Input {...register("calle")} />
          </Field>
          <Field label="Número" className="md:col-span-1">
            <Input {...register("numero")} />
          </Field>
        </FormSection>

        <FormSection title="Educación" icon={GraduationCap}>
          <Field label="Primario" className="md:col-span-1">
            <Input {...register("primario")} />
          </Field>
          <Field label="Secundario" className="md:col-span-1">
            <Input {...register("secundario")} />
          </Field>
          <Field label="Terciario" className="md:col-span-1">
            <Input {...register("terciario")} />
          </Field>
          <Field label="Año de egreso" className="md:col-span-1">
            <Input
              type="number"
              {...register("anio_egreso", {
                setValueAs: (v) =>
                  v === "" || v === null || v === undefined ? undefined : Number(v),
              })}
              error={errors.anio_egreso?.message}
            />
          </Field>
        </FormSection>

        <FormSection title="Información laboral" icon={Briefcase}>
          <Field label="Oficio" className="md:col-span-1">
            <Input {...register("oficio")} />
          </Field>
          <Field label="Coordinador" className="md:col-span-1">
            <Input {...register("coordinador")} />
          </Field>
          <Field label="Antigüedad" className="md:col-span-2">
            <Input {...register("antiguedad")} />
          </Field>
        </FormSection>

        <FormSection title="Beneficios" icon={Gift}>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Controller
              name="ayuda_economica"
              control={control}
              render={({ field }) => (
                <CheckboxField
                  label="Ayuda económica"
                  checked={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              )}
            />
            <Controller
              name="ayuda_materiales"
              control={control}
              render={({ field }) => (
                <CheckboxField
                  label="Ayuda materiales"
                  checked={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              )}
            />
          </div>
          <Field label="Otros beneficios" className="md:col-span-2">
            <Textarea {...register("otros_beneficios")} />
          </Field>
        </FormSection>

        <FormSection title="Otros" icon={Sparkles}>
          <Field label="Capacitaciones" className="md:col-span-2">
            <Textarea {...register("capacitaciones")} />
          </Field>
          <div className="md:col-span-2">
            <Controller
              name="medio_movilidad"
              control={control}
              render={({ field }) => (
                <CheckboxField
                  label="Medio de movilidad"
                  checked={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              )}
            />
          </div>
          <Field label="Licencias" className="md:col-span-2">
            <Input {...register("licencias")} />
          </Field>
          <div className="md:col-span-2">
            <Controller
              name="activo"
              control={control}
              render={({ field }) => (
                <CheckboxField
                  label="Estado activo"
                  checked={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              )}
            />
          </div>
        </FormSection>

        <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-border bg-background/95 py-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
          <Link to={isEdit && id ? `/people/${id}` : "/people"}>
            <Button type="button" variant="ghost" className="rounded-xl">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" className="min-w-[120px] rounded-xl px-6" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
