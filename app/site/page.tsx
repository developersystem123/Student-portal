import BannerOne from "@/components/site/BannerOne";
import SlidingTextOne from "@/components/site/SlidingTextOne";
import CategoryOne from "@/components/site/CategoryOne";
import AboutOne from "@/components/site/AboutOne";
import CoursesOne from "@/components/site/CoursesOne";
import WhyChooseOne from "@/components/site/WhyChooseOne";
import CounterOne from "@/components/site/CounterOne";
import TeamOne from "@/components/site/TeamOne";
import NewsletterOne from "@/components/site/NewsletterOne";
import TestimonialOne from "@/components/site/TestimonialOne";
import SlidingTextThree from "@/components/site/SlidingTextThree";
import LiveClassOne from "@/components/site/LiveClassOne";
import VideoOne from "@/components/site/VideoOne";
import SlidingTextTwo from "@/components/site/SlidingTextTwo";
import BlogOne from "@/components/site/BlogOne";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Learn Anything, Faster With AI",
  description:
    "EduPortal blends world-class courses with an AI tutor, quiz generator and assignment helper — so you stop memorising and start understanding. Browse courses in web dev, data science, design and more.",
  path: "/",
});

// Header, footer, stylesheets, scripts and the theme live in ./layout.tsx.
export default function SiteHomePage() {
  return (
    <>
      <BannerOne />
      <SlidingTextOne />
      <CategoryOne />
      <AboutOne />
      <CoursesOne />
      <WhyChooseOne />
      <CounterOne />
      <TeamOne />
      <NewsletterOne />
      <TestimonialOne />
      <SlidingTextThree />
      <LiveClassOne />
      <VideoOne />
      <SlidingTextTwo />
      <BlogOne />
    </>
  );
}
