"use client";

export const AddButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="py-1 px-2 rounded-md opacity-70 hover:opacity-80"
    >
      <svg
        className="w-6 h-6 text-gray-400 "
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
