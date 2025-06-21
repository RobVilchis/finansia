"use client";

import { Button, Dialog, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { useForm, Controller, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBreakpoint } from "../hooks/useBreakpoint";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: {
    id: string;
    name: string;
    type: string;
  };
  onDelete: (id: string) => void;
  onAccountUpdated: () => void;
}

const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.string().min(1, "Account type is required"),
});

type AccountFormData = z.infer<typeof accountSchema>;

type FieldProps = {
  field: ControllerRenderProps<AccountFormData, keyof AccountFormData>;
};

export default function AccountDialog({
  open,
  onOpenChange,
  account,
  onDelete,
  onAccountUpdated,
}: AccountDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account.name,
      type: account.type,
    },
  });

  const bp = useBreakpoint();
  const size = bp === "lg" ? "2" : bp === "md" ? "2" : "3";

  const onSubmit = async (data: AccountFormData) => {
    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update account");

      onAccountUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update account:", error);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <div className="flex justify-between items-center mb-2">
          <Dialog.Title>Edit account</Dialog.Title>
          <Button
            variant="soft"
            color="red"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </Button>
        </div>

        {showDeleteConfirm ? (
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this account? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="soft"
                color="gray"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button color="red" onClick={() => onDelete(account.id)}>
                Delete Account
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Account name
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }: FieldProps) => (
                  <TextField.Root
                    size={size}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Account type
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }: FieldProps) => (
                  <TextField.Root
                    size={size}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="e.g., Checking, Savings, Credit Card"
                  />
                )}
              />
              {errors.type && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" color="blue">
                Update
              </Button>
            </div>
          </form>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
