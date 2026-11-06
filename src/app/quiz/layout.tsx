import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What kind of Colombia traveler are you? | Me Gusta Colombia",
  description:
    "Six questions, two minutes. Get your traveler profile and the first moves for Bogotá, Medellín or Cartagena.",
  openGraph: {
    title: "What kind of Colombia traveler are you?",
    description:
      "Six questions, two minutes. Get your traveler profile and the first moves for Bogotá, Medellín or Cartagena.",
    url: "https://megusta.com.co/quiz",
    siteName: "Me Gusta Colombia",
    locale: "en_US",
    type: "website",
  },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
