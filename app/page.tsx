import SangatPage from "./sangat/page";

export const revalidate = 300;

/**
 * Homepage = SikhStack & SikhInterest publication hub.
 * The hub (feed tabs, Share Article modal, Edit Profile modal, and the
 * compact "Continue learning" strip) lives in app/sangat/page.tsx so both
 * "/" and "/sangat" render the same single implementation.
 */
export default function HomePage() {
  return <SangatPage />;
}
