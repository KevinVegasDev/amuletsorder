"use client";

import Image from "next/image";

const ResumeHome = () => {
  return (
    <section className="max-w-[1920px] mx-auto flex flex-col md:flex-row p-4 md:p-8 gap-[16px] items-stretch">
      <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-0">
        <Image
          src="/colection-1.png"
          alt="image resum"
          fill
          className="object-cover rounded-3xl "
          priority
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center rounded-3xl bg-gris p-8 md:p-16">
        <h4 className="text-[48px] font-medium text-negro"></h4>
        <p className="text-[20px]  text-negro ">
          This is your amulet, your identity. A signal recognized by those who
          see beyond the surface. <br />
          Each piece functions as an access point, a system of identity,
          filtered, verified, accepted or denied. <br />
          You are not just wearing a design, you are wearing a response. An
          answer to a question not everyone can read. <br /> <br />
          Your clothes, your amulet.
        </p>
      </div>
    </section>
  );
};

export default ResumeHome;
