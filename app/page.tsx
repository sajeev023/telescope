import { Hero } from '@/components/site/sections/Hero'
import { TrustedBy } from '@/components/site/sections/TrustedBy'
import { Problem } from '@/components/site/sections/Problem'
import { Solution } from '@/components/site/sections/Solution'
import { InteractiveDemo } from '@/components/site/sections/InteractiveDemo'
import { Features } from '@/components/site/sections/Features'
import { WhyTelescope } from '@/components/site/sections/WhyTelescope'
import { Workflow } from '@/components/site/sections/Workflow'
import { Architecture } from '@/components/site/sections/Architecture'
import { Testimonials } from '@/components/site/sections/Testimonials'
import { TechStack } from '@/components/site/sections/TechStack'
import { Faq } from '@/components/site/sections/Faq'
import { FinalCta } from '@/components/site/sections/FinalCta'

export default function Home() {
  return (
    <>
      <Hero />
      <div id="product" />
      <TrustedBy />
      <Problem />
      <Solution />
      <InteractiveDemo />
      <Features />
      <WhyTelescope />
      <Workflow />
      <Architecture />
      <Testimonials />
      <TechStack />
      <Faq />
      <FinalCta />
    </>
  )
}