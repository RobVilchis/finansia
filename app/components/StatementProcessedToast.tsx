
import { Toast } from "radix-ui";

export const StatementProcessedToastProvider = ({ open, setOpen, children }: { open: boolean, setOpen: (open: boolean) => void, children: React.ReactNode }) => {
    return (
        <Toast.Provider swipeDirection="right">

            {children}

            <Toast.Root className="w-30 h-20 rounded-md bg-green-500 text-green-900 animate-slide-in-right-right animate-duration-300 animate-ease-in-out" open={open} onOpenChange={setOpen}>
                <Toast.Title className="ToastTitle">¡Listo!</Toast.Title>
                <Toast.Description asChild>
                    <span>Tu estado de cuenta ha sido procesado exitosamente</span>
                </Toast.Description>
                <Toast.Action
                    className="ToastAction"
                    asChild
                    altText="Goto statement to undo"
                >
                    <button className="Button small green">Ver estado de cuenta</button>
                </Toast.Action>
            </Toast.Root>
            <Toast.Viewport className="ToastViewport" />
        </Toast.Provider>
    );
};