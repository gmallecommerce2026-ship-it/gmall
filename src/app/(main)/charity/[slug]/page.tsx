import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CharityService } from '@/services/charity.service';
import CharityFundClient from './CharityFundClient';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const fund = await CharityService.getFund(slug);
    return {
      title: `${fund.name} — Quỹ từ thiện`,
      description: fund.description ?? undefined,
    };
  } catch {
    return { title: 'Quỹ từ thiện' };
  }
}

export default async function CharityFundPage({ params }: Props) {
  const { slug } = await params;

  let fund;
  let donations;
  try {
    [fund, donations] = await Promise.all([
      CharityService.getFund(slug),
      CharityService.listDonations(slug, 20),
    ]);
  } catch (err) {
    console.error('[charity/[slug]] Failed to load', err);
    return notFound();
  }

  return <CharityFundClient fund={fund} donations={donations} />;
}
