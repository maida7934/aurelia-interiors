import HeroSection from "@/components/HeroSection";

export default function Home() {
  return (
    <main>
      <HeroSection />

      {/* Placeholder next section — only visible after hero animation completes */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5ede3",
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "2.4rem",
          fontWeight: 300,
          letterSpacing: "0.06em",
          color: "#3c2914",
        }}
      >
        Next Section
      </section>
    </main>
  );
}
