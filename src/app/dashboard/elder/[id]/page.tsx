import { ElderDashboardComponent } from '@/components/elder-dashboard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params; // Await the Promise before using params
  return <ElderDashboardComponent elderId={id} />;
}
