"use client";

import Image from "next/image";

const ResumeHome = () => {
  return (
    <section className="max-w-[1920px] mx-auto flex p-8 gap-[16px] items-stretch">
      <div className="w-1/2 relative">
        <Image
          src="/colection-1.png"
          alt="image resum"
          fill
          className="object-cover rounded-3xl "
          priority
        />
      </div>
      <div className="w-1/2 flex flex-col justify-center rounded-3xl bg-gris p-16">
        <h4 className="text-[48px] font-medium text-negro">
          About Amulets Order
        </h4>
        <p className="font-light text-[20px] text-negro leading-none">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </section>
  );
};

export default ResumeHome;
