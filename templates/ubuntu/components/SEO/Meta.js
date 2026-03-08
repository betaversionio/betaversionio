import React from 'react'
import Head from 'next/head';
import { usePortfolio } from '../../lib/portfolio-context';

export default function Meta() {
    const { data } = usePortfolio();

    const name = data?.user?.name || data?.user?.username || 'Portfolio';
    const headline = data?.user?.profile?.headline || 'Developer';
    const bio = data?.user?.profile?.bio || '';
    const avatar = data?.user?.avatarUrl || '';
    const title = `${name} - ${headline}`;
    const description = bio ? bio.substring(0, 160) : `${name}'s Portfolio - Ubuntu Desktop Theme`;

    return (
        <Head>
            <title>{title}</title>
            <meta charSet="utf-8" />
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            <meta name="author" content={name} />
            <meta name="robots" content="index, follow" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="language" content="English" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#E95420" />

            <meta name="image" content={avatar} />
            <meta itemProp="name" content={title} />
            <meta itemProp="description" content={description} />
            <meta itemProp="image" content={avatar} />

            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image:src" content={avatar} />

            <meta name="og:title" content={title} />
            <meta name="og:description" content={description} />
            <meta name="og:image" content={avatar} />
            <meta name="og:type" content="website" />

            <link rel="icon" href="images/logos/fevicon.svg" />
            <link rel="apple-touch-icon" href="images/logos/logo.png" />
            <link rel="preload" href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap" as="style" />
            <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap" rel="stylesheet"></link>
        </Head>
    )
}
