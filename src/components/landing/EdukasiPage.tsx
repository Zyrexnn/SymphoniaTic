import React, { useCallback, useEffect, useState } from 'react';
import { Header } from './Navbar';
import { EducationHero } from './EducationHero';
import { EducationNav } from './EducationNav';
import { EtiquetteSection } from './EtiquetteSection';
import { DressCodeSection } from './DressCodeSection';
import { ComposerSpotlight } from './ComposerSpotlight';
import { GlossarySection } from './GlossarySection';
import { ConcertGuide } from './ConcertGuide';
import { EducationCTA } from './EducationCTA';
import { Footer } from './Footer';
import { EDUKASI_NAV, type EdukasiSectionId } from './edukasiData';

const EdukasiPage: React.FC = () => {
  const [active, setActive] = useState<EdukasiSectionId>('etika');

  const scrollTo = useCallback((id: EdukasiSectionId) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    const targets = EDUKASI_NAV.map((n) => document.getElementById(n.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id as EdukasiSectionId);
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#183B56]">
      <Header isScrolled />
      <EducationHero />
      <EducationNav active={active} onSelect={scrollTo} />
      <main>
        <EtiquetteSection />
        <DressCodeSection />
        <ComposerSpotlight />
        <GlossarySection />
        <ConcertGuide />
      </main>
      <EducationCTA />
    </div>
  );
};

export default EdukasiPage;
