import { FadeIn } from "@/components/animations/fade-in";

export default function Template({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <FadeIn>{children}</FadeIn>;
}
