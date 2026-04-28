"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, VisuallyHidden } from "@radix-ui/themes";
import { Upload, FileText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { useToast } from "./GenericToast";
import {
  GlassDialogShell,
  GlassInput,
  GlassSelect,
  GlassButton,
  GlassSegmented,
  FieldLabel,
  glassDialogContent,
} from "./ui/glass";

interface UploadStatementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatementUpload: () => void;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

const uploadSchema = z.object({
  accountId: z.string(),
  accountType: z.enum(["checking", "credit"]),
  comments: z.string().optional(),
  file: z.any(),
});
type UploadFormData = z.infer<typeof uploadSchema>;

export default function UploadStatementDialog({
  open,
  onOpenChange,
  onStatementUpload,
}: UploadStatementDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { showToast } = useToast();

  const { control, handleSubmit, register } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { accountType: "checking", comments: "" },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      if (data.file.length > 0) {
        formData.append("file", data.file[0]);
      }
      formData.append("accountId", data.accountId);
      formData.append("accountType", data.accountType);
      if (data.comments) formData.append("comments", data.comments);

      const response = await fetch("/api/upload-statement", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload statement");

      setSelectedFile(null);
      onOpenChange(false);
      onStatementUpload();
    } catch (error) {
      console.error("Error uploading statement:", error);
      showToast({
        title: "Error al subir estado de cuenta",
        message: "No se pudo subir el archivo. Intenta de nuevo.",
        variant: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onOpenChange(false);
  };

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then(setAccounts)
      .catch((error) => {
        console.error("Error fetching accounts:", error);
        showToast({
          title: "Error al cargar cuentas",
          message: "No se pudieron obtener las cuentas.",
          variant: "error",
        });
      });
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="460px" className={glassDialogContent}>
        <VisuallyHidden>
          <Dialog.Title>Subir estado de cuenta</Dialog.Title>
        </VisuallyHidden>
        <GlassDialogShell
          icon={<Upload size={16} />}
          title="Subir estado de cuenta"
          subtitle="Importa un PDF para extraer transacciones"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <FieldLabel>Cuenta destino</FieldLabel>
              <Controller
                name="accountId"
                control={control}
                render={({ field }) => (
                  <GlassSelect {...field} value={field.value ?? ""}>
                    <option value="">Selecciona una cuenta</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (${a.balance})
                      </option>
                    ))}
                  </GlassSelect>
                )}
              />
            </div>

            <div>
              <FieldLabel>Tipo de estado</FieldLabel>
              <Controller
                name="accountType"
                control={control}
                render={({ field }) => (
                  <GlassSegmented
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "checking", label: "Débito" },
                      { value: "credit", label: "Crédito" },
                    ]}
                  />
                )}
              />
            </div>

            <div>
              <FieldLabel>Instrucciones adicionales (opcional)</FieldLabel>
              <GlassInput
                placeholder="Notas para el procesamiento..."
                {...register("comments")}
              />
            </div>

            <div>
              <input
                type="file"
                id="file-upload"
                accept=".pdf"
                {...register("file", { onChange: handleFileChange })}
                className="hidden"
              />
              {selectedFile ? (
                <div className="flex items-center gap-3 p-3 bg-white/6 border border-white/10 rounded-lg">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-300 shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-white/40 font-mono tabular-nums">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 text-white/40 hover:text-white/80 hover:bg-white/8 rounded-md transition-colors cursor-pointer"
                    aria-label="Quitar archivo"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-28
                    bg-white/4 border-2 border-dashed border-white/15 rounded-xl cursor-pointer
                    hover:bg-white/6 hover:border-cyan-400/30 transition-all"
                >
                  <Upload size={20} className="text-white/40 mb-2" />
                  <p className="text-sm text-white/60">
                    <span className="text-cyan-300">Haz clic</span> o arrastra un archivo
                  </p>
                  <p className="text-[11px] text-white/30 mt-0.5">PDF, máx 10MB</p>
                </label>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/8 mt-2">
              <GlassButton
                type="button"
                variant="secondary"
                onClick={handleClose}
              >
                Cancelar
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Subiendo..." : "Subir"}
              </GlassButton>
            </div>
          </form>
        </GlassDialogShell>
      </Dialog.Content>
    </Dialog.Root>
  );
}
