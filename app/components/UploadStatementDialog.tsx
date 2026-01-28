"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  SegmentedControl,
  Select,
  TextField,
} from "@radix-ui/themes";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, ControllerRenderProps, useForm } from "react-hook-form";
import z from "zod";
import { useBreakpoint } from "../hooks/useBreakpoint";

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
  accountType: z.string(),
  comments: z.string().optional(),
  file: z.any(),
});
type UploadFormData = z.infer<typeof uploadSchema>;

export type FieldProps<T extends keyof UploadFormData> = {
  field: ControllerRenderProps<UploadFormData, T>;
};

export default function UploadStatementDialog({
  open,
  onOpenChange,
  onStatementUpload,
}: UploadStatementDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const { control, handleSubmit, register } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { accountType: "checking", comments: "" },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
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

      if (data.comments) {
        formData.append("comments", data.comments);
      }

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
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onOpenChange(false);
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/accounts");
        if (!response.ok) throw new Error("Failed to fetch accounts");
        const data = await response.json();
        setAccounts(data);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  const bp = useBreakpoint();
  const size = bp === "lg" ? "2" : bp === "md" ? "2" : "3";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-between items-center mb-2">
            <Dialog.Title>Subir estado de cuenta</Dialog.Title>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-3 block">
                  Selecciona la cuenta a considerar. Todos los ingresos y gastos
                  se aplicarán a esta.
                </label>

                <Controller
                  name="accountId"
                  control={control}
                  render={({ field }: FieldProps<"accountId">) => (
                    <Select.Root
                      value={field.value}
                      onValueChange={field.onChange}
                      size={size}
                    >
                      <Select.Trigger placeholder="Elige una" />
                      <Select.Content>
                        {accounts.map((account, i) => (
                          <Select.Item key={i} value={account.id}>
                            {account.name} (${account.balance})
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                />
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-3 block">
                  ¿Tu estado de cuenta es de débito o crédito?
                </label>
                <Controller
                  name="accountType"
                  control={control}
                  render={({ field }: FieldProps<"accountType">) => (
                    <SegmentedControl.Root
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SegmentedControl.Item value="checking">
                        Débito
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="credit">
                        Crédito
                      </SegmentedControl.Item>
                    </SegmentedControl.Root>
                  )}
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-3 block">
                  ¿Alguna instrucción adicional? (opcional)
                </label>
                <Controller
                  name="comments"
                  control={control}
                  render={({ field }: FieldProps<"comments">) => (
                    <TextField.Root
                      size={size}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf"
                  {...register("file", {
                    onChange: (e) => {
                      handleFileChange(e);
                    },
                  })}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 
                border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer 
                  hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Haz clic para subir</span>{" "}
                      o arrastra y suelta
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF, CSV, XLSX (MAX. 10MB)
                    </p>
                  </div>
                </label>
              </div>
              {selectedFile && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Dialog.Close>
                <Button variant="soft" color="gray" onClick={handleClose}>
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button
                color="blue"
                type="submit"
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "Subiendo..." : "Subir"}
              </Button>
            </div>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
