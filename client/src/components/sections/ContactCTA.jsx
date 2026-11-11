import { ArrowUpRight, Mail } from 'lucide-react';
import { useSite } from '../../context/SiteContext.jsx';
import { Button, Reveal } from '../ui.jsx';

export default function ContactCTA() {
  const { profile, settings } = useSite();
  return (
    <section className="py-16 md:py-24">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface px-6 py-16 text-center md:px-16 md:py-24">
            <div className="absolute inset-0 -z-0 bg-[radial-gradient(50%_80%_at_50%_0%,var(--glow),transparent),radial-gradient(40%_60%_at_100%_100%,color-mix(in_srgb,var(--aqua)_18%,transparent),transparent)]" />
            <div className="grid-bg absolute inset-0 opacity-70" />
            <div className="relative">
              <p className="eyebrow mb-5">{settings?.availability || 'Get in touch'}</p>
              <h2 className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-[1.02] md:text-6xl">
                Have an idea, a question or an opportunity? <span className="text-gradient">Let&apos;s talk.</span>
              </h2>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Button to="/contact" variant="gradient" size="lg">
                  Send a message <ArrowUpRight className="h-4 w-4" />
                </Button>
                {profile?.email && (
                  <Button href={`mailto:${profile.email}`} variant="outline" size="lg">
                    <Mail className="h-4 w-4" /> {profile.email}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
