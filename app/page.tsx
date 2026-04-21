import HeroSection from "@/components/HeroSection";
import EssenceSection from "@/components/EssenceSection";
import ScrollShowcase from "@/components/ScrollShowcase";
import StudioSection from "@/components/StudioSection";
import OriginObjectsSection from "@/components/OriginObjectsSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <EssenceSection />
      <ScrollShowcase />
      <StudioSection />
      <OriginObjectsSection />
    </main>
  );
}
