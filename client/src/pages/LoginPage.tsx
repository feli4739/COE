import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FireBurstLogo } from "@/components/branding/FireBurstLogo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresá la contraseña"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginValues) => {
    setServerError(null);
    try {
      const res = (await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
        skipAuthRedirect: true,
      })) as { token: string; user: { id: string; email: string } };
      setAuth(res.token, res.user);
      navigate("/", { replace: true });
    } catch (e) {
      if (e instanceof ApiError) setServerError(e.message);
      else setServerError("Error de red");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-radial-fire" />
      <div className="pointer-events-none absolute -left-24 top-16 h-[28rem] w-[28rem] rounded-full bg-primary/[0.12] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-accent/5 blur-[90px]" />

      <div
        className="relative w-full max-w-[420px] rounded-2xl border border-white/[0.09] bg-[#0d0d0d]/85 p-9 shadow-lift backdrop-blur-2xl sm:p-10"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,46,0,0.11), inset 0 1px 0 rgba(255,255,255,0.04), 0 28px 80px rgba(0,0,0,0.55)",
        }}
      >
        <div className="mb-10 flex flex-col items-center text-center">
          <FireBurstLogo variant="login" className="mb-5" />
          <p className="text-[13px] font-medium tracking-wide text-muted/95">
            Sistema interno de personas
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              Email<span className="text-primary"> *</span>
            </label>
            <Input
              type="email"
              autoComplete="email"
              placeholder="tu@organizacion.gob"
              className="rounded-xl py-2.5"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              Contraseña<span className="text-primary"> *</span>
            </label>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="rounded-xl py-2.5"
              error={errors.password?.message}
              {...register("password")}
            />
          </div>
          {serverError ? (
            <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-center text-[13px] text-red-300" role="alert">
              {serverError}
            </p>
          ) : null}
          <Button
            type="submit"
            className="mt-1 w-full py-3 text-[15px] font-semibold tracking-tight"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
