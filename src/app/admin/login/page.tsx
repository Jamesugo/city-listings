import LoginForm from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; tier?: string }>;
}) {
  const { error, message, tier } = await searchParams;

  return <LoginForm error={error} message={message} tier={tier} />;
}
