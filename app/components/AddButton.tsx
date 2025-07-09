"use client";

export const AddButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="py-3 px-3 rounded-md opacity-70 bg-slate-300  dark:bg-slate-700 hover:opacity-80 transition-opacity"
    >
      <svg
        className="w-4 h-4 text-slate-700 dark:text-slate-200 "
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        fill="currentColor"
        version="1.1"
        viewBox="0 0 512 512"
        width="512"
        height="512"
      >
        <path d="M480,224H288V32c0-17.673-14.327-32-32-32s-32,14.327-32,32v192H32c-17.673,0-32,14.327-32,32s14.327,32,32,32h192v192   c0,17.673,14.327,32,32,32s32-14.327,32-32V288h192c17.673,0,32-14.327,32-32S497.673,224,480,224z" />
      </svg>
    </button>
  );
};
