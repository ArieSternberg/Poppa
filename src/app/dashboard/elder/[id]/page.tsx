import { ElderDashboardComponent } from '@/components/elder-dashboard'

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return <ElderDashboardComponent elderId={id} />
} 