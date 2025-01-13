import { ElderDashboardComponent } from '@/components/elder-dashboard'

interface PageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function Page({ params }: PageProps) {
  return <ElderDashboardComponent elderId={params.id} />
} 