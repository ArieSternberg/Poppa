import { ElderDashboardComponent } from '@/components/elder-dashboard'

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  return <ElderDashboardComponent elderId={id} />
} 