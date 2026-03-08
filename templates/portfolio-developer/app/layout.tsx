import type { Metadata } from 'next';
import { Anton, Roboto_Flex } from 'next/font/google';
import { ReactLenis } from 'lenis/react';

import 'lenis/dist/lenis.css';
import './globals.css';
import Footer from '@/components/Footer';
import ScrollProgressIndicator from '@/components/ScrollProgressIndicator';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';
import CustomCursor from '@/components/CustomCursor';
import Preloader from '../components/Preloader';
import StickyEmail from './_components/StickyEmail';
import { getPortfolioData, mapGeneralInfo, mapSocialLinks } from '@/lib/data';

const antonFont = Anton({
    weight: '400',
    style: 'normal',
    subsets: ['latin'],
    variable: '--font-anton',
});

const robotoFlex = Roboto_Flex({
    weight: ['100', '400', '500', '600', '700', '800'],
    style: 'normal',
    subsets: ['latin'],
    variable: '--font-roboto-flex',
});

export async function generateMetadata(): Promise<Metadata> {
    const data = await getPortfolioData();
    const name = data?.user.name ?? data?.user.username ?? 'Portfolio';
    const headline = data?.user.profile?.headline ?? '';

    return {
        title: {
            default: `${name} - ${headline || 'Portfolio'}`,
            template: `%s | ${name}`,
        },
        description: data?.user.profile?.bio?.split('\n')[0] ?? 'Personal portfolio',
    };
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const data = await getPortfolioData();
    const generalInfo = data ? mapGeneralInfo(data) : { email: '' };
    const socialLinks = data ? mapSocialLinks(data) : [];
    const name = data?.user.name ?? data?.user.username ?? '';

    return (
        <html lang="en">
            <body
                className={`${antonFont.variable} ${robotoFlex.variable} antialiased`}
            >
                <ReactLenis
                    root
                    options={{
                        lerp: 0.1,
                        duration: 1.4,
                    }}
                >
                    <Navbar email={generalInfo.email} socialLinks={socialLinks} />
                    <main>{children}</main>
                    <Footer email={generalInfo.email} name={name} />

                    <CustomCursor />
                    <Preloader name={name} />
                    <ScrollProgressIndicator />
                    <ParticleBackground />
                    <StickyEmail email={generalInfo.email} />
                </ReactLenis>
            </body>
        </html>
    );
}
