/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHeader from "@/components/site/PageHeader";
import { courseImage } from "@/components/site/catalog/CourseCard";
import PhysicalApply from "@/components/site/catalog/PhysicalApply";
import StarRating from "@/components/site/StarRating";
import CourseDetailNav from "@/components/site/catalog/CourseDetailNav";
import EnrollLink from "@/components/site/catalog/EnrollLink";
import { getCourse } from "@/components/site/data";
import { formatHours } from "@/lib/utils";
import { absoluteImage, absoluteUrl, pageMetadata } from "@/lib/site";

// Courses are read live from the database, so admin/teacher edits and new courses show up straight away.
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) {
    return {
      title: "Course not found",
      description: "This EduPortal course could not be found. Browse the full catalogue to find your next course.",
      robots: { index: false, follow: false },
    };
  }
  return pageMetadata({
    title: course.title,
    description:
      course.description ||
      `Learn ${course.title} with ${course.instructor} on EduPortal — expert-led lessons, an AI tutor and a verified certificate.`,
    // Always the slug URL, so older /courses/<id> links never split the page's ranking.
    path: `/courses/${course.slug}`,
    images: [absoluteImage(courseImage(course))],
  });
}
export default async function CourseDetailsPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();
  const image = courseImage(course);
  return (
    <>
      <PageHeader title={course.title} parents={[{ href: "/courses", label: "Courses" }]} />
      {/* Course structured data, so search engines can show the price and rating in results. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: course.title,
            description: course.description,
            url: absoluteUrl(`/courses/${course.slug}`),
            image: absoluteImage(image),
            provider: { "@type": "Organization", name: "EduPortal", sameAs: absoluteUrl("/") },
            offers: {
              "@type": "Offer",
              price: course.price,
              priceCurrency: "PKR",
              availability: "https://schema.org/InStock",
              url: absoluteUrl(`/courses/${course.slug}`),
            },
            ...(course.reviews > 0
              ? { aggregateRating: { "@type": "AggregateRating", ratingValue: course.rating, reviewCount: course.reviews } }
              : {}),
          }),
        }}
      />
      <section className="course-details edu-detail"><div className="container"><div className="row">
        <div className="col-xl-8 col-lg-7"><div className="course-details__left">
          <div className="course-details__img"><img src={image} alt={course.title} loading="lazy" decoding="async" /></div>
          <div className="course-details__content">
            <div className="course-details__tag-box"><div className="course-details__tag-shape" /><span className="course-details__tag">{course.category}</span></div>
            {/* The course title is the page's <h1> in the banner above, so it is not repeated here.
                The figures in this row are values, not headings, so they are plain text. */}
            <div className="course-details__client-and-ratting-box"><div className="course-details__client-box"><div className="course-details__client-content"><p>Instructor</p><p className="edu-detail__value">{course.instructor}</p></div></div>
              <div className="course-details__ratting-box-1"><ul className="course-details__ratting-list-1 list-unstyled"><li><p>Skill level</p><p className="edu-detail__value">{course.level}</p></li><li><p>Student reviews</p><p className="edu-detail__value">{course.reviews.toLocaleString()}</p></li><li><p>Rating</p><p className="edu-detail__value"><span className="icon-star edu-star" /> {course.rating} / 5</p></li></ul></div>
            </div>
            <div className="course-details__main-tab-box edu-detail__sections">
              <CourseDetailNav />
              <div className="course-details__tab-inner edu-detail__panel" id="overview"><div className="course-details__overview"><h2 className="course-details__overview-title">Course Overview</h2><p className="course-details__overview-text-1">{course.description}</p>{course.chapters.length > 0 && <><h3 className="course-details__overview-title-2">What you will learn</h3><ul className="course-details__overview-points list-unstyled">{course.chapters.map(ch => <li key={ch.id}><div className="course-details__overview-points-icon"><span className="fas fa-check" /></div><div className="course-details__overview-points-content"><h4>{ch.title}</h4></div></li>)}</ul></>}<h3 className="course-details__overview-title-3">Topics</h3><p className="course-details__overview-text-3">{course.tags.join(" · ")}</p></div></div>
              <div className="course-details__tab-inner edu-detail__panel" id="curriculum"><div className="course-details__curriculam"><h2 className="course-details__curriculam-title">Course Curriculum</h2><p className="course-details__curriculam-text">{course.chapters.length ? <>Explore {course.chapters.length} lessons in this {formatHours(course.durationMinutes)} course. Sign up to start learning.</> : "Lessons for this course are being prepared — check back soon."}</p><div className="course-details__curriculam-faq"><div className="faq-one-accrodion edu-detail__lessons">{course.chapters.map((chapter, index) => <div className="accrodion edu-detail__lesson" key={chapter.id}><div className="accrodion-title"><div className="accrodion-title-box"><div className="accrodion-title__count">{String(index + 1).padStart(2, "0")}</div><div className="accrodion-title-text"><h3>{chapter.title}</h3></div></div><ul className="accrodion-meta list-unstyled"><li><p><span className="icon-clock" /> {Math.ceil(chapter.duration / 60)} min</p></li></ul></div></div>)}</div></div></div></div>
              <div className="course-details__tab-inner edu-detail__panel" id="instructor"><div className="course-details__Instructor"><div className="course-details__Instructor-content"><div className="course-details__Instructor-client-name-box-and-view"><div className="course-details__Instructor-client-name-box"><h2>{course.instructor}</h2><p>Course instructor · {course.category}</p></div></div><p className="course-details__Instructor-text">Learn {course.title} with {course.instructor}. Explore the curriculum above and sign up to start learning.</p></div></div></div>
              <div className="course-details__tab-inner edu-detail__panel" id="review"><div className="course-details__review-box"><div className="course-details__review-count"><p className="edu-detail__score">{course.rating}</p></div><div className="course-details__review-content"><p>{course.reviews.toLocaleString()} reviews</p><StarRating rating={course.rating} className="course-details__review-ratting" /><p>Average rating: {course.rating} out of 5</p></div></div><p>Individual reviews are available in your student portal.</p></div>
            </div>
          </div>
        </div></div>
        <div className="col-xl-4 col-lg-5"><aside className="course-details__right edu-enroll" aria-label="Enroll in this course"><div className="course-details__info-box">
          <div className="edu-enroll__price"><p>Course fee</p><h3 className="course-details__doller">{course.price === 0 ? "Free" : `$${course.price}`}</h3></div>
          <div className="edu-enroll__actions"><EnrollLink className="thm-btn edu-enroll__primary" next={`/courses/${encodeURIComponent(course.slug)}`} signedIn={<><span className="icon-angles-right" />Open course</>}><span className="icon-angles-right" />Enroll online</EnrollLink><PhysicalApply course={course} /></div>
          <p className="edu-enroll__note">Prefer a classroom? Apply for in-person classes and our admissions team will reply within 2&ndash;3 working days.</p>
          <div className="course-details__info-list"><h3 className="course-details__info-list-title">This Course Includes</h3><ul className="course-details__info-list-1 list-unstyled"><li><p><i className="icon-book" />Lessons</p><span>{course.chapters.length}</span></li><li><p><i className="icon-clock" />Duration</p><span>{formatHours(course.durationMinutes)}</span></li><li><p><i className="icon-chart-simple" />Skill Level</p><span>{course.level}</span></li><li><p><i className="icon-stamp" />Category</p><span>{course.category}</span></li></ul></div>
        </div></aside></div>
      </div></div></section>
    </>
  );
}
