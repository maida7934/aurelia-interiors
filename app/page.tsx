import HeroSection from "@/components/HeroSection";
import EssenceSection from "@/components/EssenceSection";
import ScrollShowcase from "@/components/ScrollShowcase";
import StudioSection from "@/components/StudioSection";
import OriginObjectsSection from "@/components/OriginObjectsSection";
import BespokeSection from "@/components/BespokeSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <EssenceSection />
      <ScrollShowcase />
      <StudioSection />
      <OriginObjectsSection />
      <BespokeSection />
      <Footer />
    </main>
  );
}
