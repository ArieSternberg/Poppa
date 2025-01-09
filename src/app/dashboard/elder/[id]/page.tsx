import { ElderDashboardComponent } from '@/components/elder-dashboard'

export default function Page({
  params,
}: {
  params: { id: string };
}) {
  return <ElderDashboardComponent elderId={params.id} />
} 