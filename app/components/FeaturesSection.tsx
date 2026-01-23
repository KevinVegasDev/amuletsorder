import Image from "next/image";

interface FeatureItem {
  icon: string;
  description: string;
}

interface FeaturesSectionProps {
  features: FeatureItem[];
}

export default function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section className="flex flex-row gap-[10px] max-w-[1920px] mx-auto py-16 items-center   ">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center bg-gris rounded-[32px] justify-center w-full text-black py-16 px-[10px] gap-[10px]">
          <div>
            <Image
              src={feature.icon}
              alt={feature.description}
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </div>
          <div>
            <span className="text-[24px]/28px ">{feature.description}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
