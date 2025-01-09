import { ElderDashboardComponent } from '@/components/elder-dashboard'

type Props = {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Page({ params }: Props) {
  return <ElderDashboardComponent elderId={params.id} />
} 