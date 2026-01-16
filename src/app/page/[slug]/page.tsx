import { generateMetadata as getMetadata } from "@/utils/getMetadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageContent from "./PageContent";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return await getMetadata('page', slug);
}

export default async function PageDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <PageContent slug={slug} />;
}

