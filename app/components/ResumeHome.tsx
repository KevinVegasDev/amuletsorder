"use client";

import Image from "next/image";

const ResumeHome = () => {
  return (
    <section className="flex px-[50px] gap-[27px] py-8 ">
      <div className="w-[554px] h-[272px] relative">
        <Image
          src="/colection-1.png"
          alt="image resum"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <h4 className="text-[64px] font-medium">
          Lorem Ipsum dolor sit amet
        </h4>
        <p className="font-light text-[24px] text-gray-600 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </section>
  );
};

export default ResumeHome;
