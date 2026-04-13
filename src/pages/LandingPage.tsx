import React from 'react';
import * as api from '../api';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import {
  Hero,
  HighLevelFlow,
  HowItWorks,
  BenefitsSection,
  AboutSectionWithShip,
  ForWhomSection,
  CTASection,
} from '../components/landing';
import { ProfileSection } from '../components/auth/ProfileSection';

export interface LandingPageProps {
  onNavigateToSimulation: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  currentUser: api.User | null;
  onNavigateHome?: () => void;
}

export function LandingPage({
  onNavigateToSimulation,
  onOpenAuth,
  onOpenProfile,
  currentUser,
  onNavigateHome,
}: LandingPageProps) {
  return (
    <>
      <Navbar
        onSimulateClick={onNavigateToSimulation}
        onOpenAuth={onOpenAuth}
        onOpenProfile={onOpenProfile}
        currentUser={currentUser}
        onNavigateHome={onNavigateHome}
      />
      <Hero onSimulateClick={onNavigateToSimulation} />
      <HighLevelFlow />
      <HowItWorks />
      <BenefitsSection />
      <AboutSectionWithShip />
      <ForWhomSection />
      <ProfileSection />
      <CTASection onSimulateClick={onNavigateToSimulation} />
      <Footer />
    </>
  );
}
