import ClientSubmissionPage from '@/app/page';

export default function StudioSubmissionPage({ params }: { params: { studioId: string } }) {
  return <ClientSubmissionPage studioId={params.studioId} />;
}
