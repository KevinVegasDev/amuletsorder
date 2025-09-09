import Slider from "./components/Slider";

const sliderImages = [
  {
    src: "/colection-1.png",
    alt: "Collection 1"
  },
  {
    src: "/colection-2.png",
    alt: "Collection 2"
  },
  {
    src: "/colection-3.png",
    alt: "Collection 3"
  }
];

export default function Home() {
  return (
    <main className="p-[50px]">
      <Slider 
        images={sliderImages}
        autoPlay={true}
        autoPlayInterval={5000}
        maxHeight="440px"
      />
    </main>
  );
}
