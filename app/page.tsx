import { About } from '@/components/sections/about';
import { Contact } from '@/components/sections/contact';
import { Experience } from '@/components/sections/experience';
import { Hero } from '@/components/sections/hero';
import { Projects } from '@/components/sections/projects';
import { Writing } from '@/components/sections/writing';
import { site } from '@/content/site';
import { getAllPosts } from '@/lib/posts';

const LATEST_POST_COUNT = 4;

export default function HomePage() {
  const posts = getAllPosts();

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    alternateName: site.nameEn,
    jobTitle: site.role,
    email: `mailto:${site.email}`,
    url: site.url,
    sameAs: [site.socials.github, site.socials.linkedin],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <Hero postCount={posts.length} />
      <About />
      <Projects />
      <Experience />
      <Writing posts={posts.slice(0, LATEST_POST_COUNT)} total={posts.length} />
      <Contact />
    </>
  );
}
